from .config import cred
import firebase_admin
from firebase_admin import firestore

firebase_admin.initialize_app(cred)
db = firestore.client()


# trendingCounts
def load_trendingdata(trend_period):
    data_dict = {}

    doc = db.collection("summaries").document(trend_period).get()
    trending_counts = doc.to_dict() if doc.exists else {}

    for cabinet_type, cabinet_data in trending_counts.items():
        if cabinet_type == "docCount":
            continue

        data_dict[cabinet_type] = {}

        for cabinet_color, floor_data in cabinet_data.items():
            data_dict[cabinet_type][cabinet_color] = {}

            for floor_color, pattern_color_data in floor_data.items():
                data_dict[cabinet_type][cabinet_color][floor_color] = pattern_color_data

    return data_dict


def calculate_total_color_pattern_counts(data_dict):

    total_color_pattern_counts = {}

    for _, cabinet_data in data_dict.items():
        for _, floor_data in cabinet_data.items():
            for _, pattern_color_data in floor_data.items():
                for pattern_color, count in pattern_color_data.items():
                    if pattern_color in total_color_pattern_counts:
                        total_color_pattern_counts[pattern_color] += count
                    else:
                        total_color_pattern_counts[pattern_color] = count

    return total_color_pattern_counts


def find_trending_color_pattern(
    data_dict, cabinet_type=None, cabinet_color=None, floor_color=None, top_n=3
):
    total_counts_per_pattern = calculate_total_color_pattern_counts(data_dict)

    filtered_data = {}

    for c_type, c_type_data in data_dict.items():
        if cabinet_type and c_type != cabinet_type:
            continue

        for c_color, c_color_data in c_type_data.items():
            if cabinet_color and c_color != cabinet_color:
                continue

            for f_color, f_color_data in c_color_data.items():
                if floor_color and f_color != floor_color:
                    continue

                for pattern_color, count in f_color_data.items():
                    if pattern_color in filtered_data:
                        filtered_data[pattern_color] += count
                    else:
                        filtered_data[pattern_color] = count

    if not filtered_data:
        return None

    pattern_color_ratios = {
        pattern_color: (count / total_counts_per_pattern[pattern_color]) * 100
        for pattern_color, count in filtered_data.items()
    }

    filtered_list = list(filtered_data.values())
    sorted_data = sorted(filtered_list)
    n = len(filtered_list)
    median_data = (
        sorted_data[n // 2]
        if n % 2 == 1
        else (sorted_data[n // 2 - 1] + sorted_data[n // 2]) / 2
    )

    filtered_ratios_above_median = {
        pattern_color: ratio
        for pattern_color, ratio in pattern_color_ratios.items()
        if median_data <= filtered_data[pattern_color]
    }

    sorted_color_patterns = sorted(
        filtered_ratios_above_median.items(), key=lambda item: item[1], reverse=True
    )[:top_n]

    return sorted_color_patterns


trendingCountsOne = load_trendingdata("surroundingTrendCountsOneYear")
trendingCountsThree = load_trendingdata("surroundingTrendCountsThreeYear")
trendingCountsTotal = load_trendingdata("surroundingTrendCounts")
