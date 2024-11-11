from .config import cred
import firebase_admin
from firebase_admin import firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()


def load_recentTrend():
    trending_doc = db.collection("summary").document("colorPatternCounts").get()
    trending_counts = trending_doc.to_dict() if trending_doc.exists else {}
    del trending_counts["docCount"]

    regional_doc = db.collection("summary").document("areaColorPatternCounts").get()
    regional_counts = regional_doc.to_dict() if regional_doc.exists else {}
    del regional_counts["docCount"]

    return trending_counts, regional_counts


recentColorPattern, recentRegionData = load_recentTrend()


def total_trend_year(data_dict, input_period):
    color_total_dict = {}
    pattern_total_dict = {}

    for color, color_data in data_dict.items():
        for pattern, pattern_data in color_data.items():
            if color in color_total_dict:
                color_total_dict[color] += pattern_data[input_period]
            else:
                color_total_dict[color] = pattern_data[input_period]

            if pattern in pattern_total_dict:
                pattern_total_dict[pattern] += pattern_data[input_period]
            else:
                pattern_total_dict[pattern] = pattern_data[input_period]

    return color_total_dict, pattern_total_dict


def calculate_median_and_filter(data_dict, trend_ratio_data_dict):
    filtered_list = list(data_dict.values())
    sorted_data = sorted(filtered_list)
    n = len(filtered_list)
    median_data = (
        sorted_data[n // 2]
        if n % 2 == 1
        else (sorted_data[n // 2 - 1] + sorted_data[n // 2]) / 2
    )

    filtered_ratios_above_median = {
        key: ratio
        for key, ratio in trend_ratio_data_dict.items()
        if median_data <= data_dict[key]
    }

    sorted_result = sorted(
        filtered_ratios_above_median.items(), key=lambda item: item[1], reverse=True
    )[:2]

    return sorted_result


def extract_trend_with_colorpattern(
    data_dict, input_period, input_color=None, input_pattern=None
):
    total_color_dict, total_pattern_dict = total_trend_year(data_dict, input_period)
    trend_data_dict = {}

    if input_color:
        trend_data_dict = {
            pattern: data[input_period]
            for pattern, data in data_dict[input_color].items()
        }
        trend_ratio_data_dict = {
            pattern: (count / total_pattern_dict[pattern]) * 100
            for pattern, count in trend_data_dict.items()
        }
    else:
        for color, color_data in data_dict.items():
            trend_data_dict[color] = color_data[input_pattern][input_period]
        trend_ratio_data_dict = {
            color: (count / total_color_dict[color]) * 100
            for color, count in trend_data_dict.items()
        }

    sorted_color_patterns = calculate_median_and_filter(
        trend_data_dict, trend_ratio_data_dict
    )
    return sorted_color_patterns[0][0], sorted_color_patterns[1][0]


def extract_surrounding_trend(
    data_dict,
    input_color=None,
    input_pattern=None,
    cabinet_type=None,
    cabinet_color=None,
    floor_color=None,
):
    trend_pattern = {}
    trend_color = {}

    total_trend_color, total_trend_pattern = total_trend_year(
        recentColorPattern, "total"
    )

    for c_type, c_type_data in data_dict.items():
        if cabinet_type and c_type != cabinet_type:
            continue

        for c_color, c_color_data in c_type_data.items():
            if cabinet_color and c_color != cabinet_color:
                continue

            for f_color, f_color_data in c_color_data.items():
                if floor_color and f_color != floor_color:
                    continue

                for color_pattern, count in f_color_data.items():
                    color, pattern = color_pattern.split("-")

                    if color == input_color:
                        trend_pattern[pattern] = trend_pattern.get(pattern, 0) + count

                    if pattern == input_pattern:
                        trend_color[color] = trend_color.get(color, 0) + count

    if input_color:
        final_dict = trend_pattern
        total_dict = total_trend_pattern
    else:
        final_dict = trend_color
        total_dict = total_trend_color

    trend_ratio_data_dict = {
        key: (count / total_dict[key]) * 100 for key, count in final_dict.items()
    }

    sorted_data = calculate_median_and_filter(final_dict, trend_ratio_data_dict)

    return sorted_data[0][0], sorted_data[1][0]


def extract_regional_trend(data_dict, regions, input_color=None, input_pattern=None):
    trend_dict = {}

    total_trend_color, total_trend_pattern = total_trend_year(
        recentColorPattern, "total"
    )

    for region in regions:
        if region not in data_dict:
            continue
        for color, color_data in data_dict[region].items():
            for pattern, counts in color_data.items():
                if color == input_color:
                    trend_dict[pattern] = trend_dict.get(pattern, 0) + counts

                if pattern == input_pattern:
                    trend_dict[color] = trend_dict.get(color, 0) + counts

    if input_color:
        total_dict = total_trend_pattern
    else:
        total_dict = total_trend_color

    trend_ratio_data_dict = {
        key: (count / total_dict[key]) * 100 for key, count in trend_dict.items()
    }

    if input_color:
        total_dict = total_trend_pattern
    else:
        total_dict = total_trend_color

    trend_ratio_data_dict = {
        key: (count / total_dict[key]) * 100 for key, count in trend_dict.items()
    }

    sorted_data = calculate_median_and_filter(trend_dict, trend_ratio_data_dict)

    return sorted_data[0][0], sorted_data[1][0]
