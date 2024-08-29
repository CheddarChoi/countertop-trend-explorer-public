import React, { useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, startAfter } from "firebase/firestore";

const ImageListComponent = ({
  inputColor,
  inputPattern,
  inputType,
  surroundingInputType,
  surroundingInputValue,
  setSelectedImage,
  needUpdate,
  setNeedUpdate,
}) => {
  const [loadedImages, setLoadedImages] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoadedImages([]);
    setLastVisible(null);
    setHasMore(true);
    fetchData(false);
  }, [inputColor, inputPattern, inputType, surroundingInputType, surroundingInputValue]);

  useEffect(() => {
    if (needUpdate) {
      setLoadedImages([]);
      setLastVisible(null);
      setHasMore(true);
      fetchData(false);
      setNeedUpdate(false);
      setSelectedImage(null);
    }
  }, [needUpdate]);

  const fetchData = async (isLoadMore = false) => {
    const colRef = collection(db, "data");

    let q = query(colRef);

    if (inputColor && inputPattern) {
      q = query(
        colRef,
        where(inputType + "_color", "==", inputColor),
        where(inputType + "_pattern", "==", inputPattern),
        orderBy(inputType + "_color_certainty", "desc"),
        orderBy(inputType + "_pattern_certainty", "desc")
      );
    } else if (inputColor) {
      q = query(
        colRef,
        where(inputType + "_color", "==", inputColor),
        orderBy(inputType + "_color_certainty", "desc")
      );
    } else if (inputPattern) {
      q = query(
        colRef,
        where(inputType + "_pattern", "==", inputPattern),
        orderBy(inputType + "_pattern_certainty", "desc")
      );
    } else if (inputType) {
      q = query(
        colRef,
        orderBy(inputType + "_color_certainty", "desc"),
        orderBy(inputType + "_pattern_certainty", "desc")
      );
    } else if (surroundingInputType && surroundingInputValue) {
      q = query(
        colRef,
        where(surroundingInputType, "==", surroundingInputValue),
        orderBy(surroundingInputType + "_certainty", "desc")
      );
    } else if (surroundingInputType) {
      q = query(colRef, orderBy(surroundingInputType + "_certainty", "desc"));
    } else {
      q = query(
        colRef,
        orderBy("cabinet_color_certainty", "desc"),
        orderBy("floor_color_certainty", "desc"),
        orderBy("cabinet_type_certainty", "desc")
      );
    }

    if (isLoadMore && lastVisible) {
      q = query(q, startAfter(lastVisible), limit(30));
    } else {
      q = query(q, limit(30));
    }

    const querySnapshot = await getDocs(q);
    const fetchedData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      data.id = doc.id;
      return data;
    });

    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    setLoadedImages((prevData) => [...prevData, ...fetchedData.slice(0, 30)]);
    setLastVisible(lastVisibleDoc);
    setHasMore(fetchedData.length === 30);
  };

  const loadMore = () => {
    fetchData(true);
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", marginTop: "10px" }}>
      <ImageList variant="masonry" cols={3} gap={8} sx={{ marginTop: "0px" }}>
        {loadedImages.map((item, index) => (
          <ImageListItem key={index}>
            <img
              src={item.img_src}
              alt={item.title}
              loading="lazy"
              onClick={() => setSelectedImage(item)}
            />
          </ImageListItem>
        ))}
        {hasMore && (
          <Button
            onClick={loadMore}
            variant="outlined"
            style={{
              lineHeight: "1.2",
              width: "100%",
              minHeight: "40px",
              borderWidth: "2px",
              fontSize: "16px",
            }}
          >
            Load More
          </Button>
        )}

        {loadedImages.length === 0 && <Typography variant="body1">No images found</Typography>}
      </ImageList>
    </div>
  );
};

export default ImageListComponent;
