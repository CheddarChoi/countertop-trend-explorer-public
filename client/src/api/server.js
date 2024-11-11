import axios from "axios";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${BASE_URL}/analyze_image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const generateImage = async (text) => {
  const response = await axios.post(`${BASE_URL}/generate_image`, {
    prompt: text,
  });

  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${BASE_URL}/upload_image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getRecommendation = async (filename, features) => {
  const response = await axios.post(`${BASE_URL}/recommendation`, {
    features: features,
    filename: filename,
  });

  return response.data;
};

export const uploadSlabImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${BASE_URL}/upload_slab_image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const editSlabImage = async (
  filename,
  weight_on_original,
  edit_propmt,
  trend_range,
  surrounding,
  region,
  inputted_info
) => {
  const response = await axios.post(`${BASE_URL}/edit_slab`, {
    filename: filename,
    weight_on_original: weight_on_original,
    edit_propmt: edit_propmt,
    trend_range: trend_range,
    surrounding: surrounding,
    region: region,
    inputted_info: inputted_info,
  });

  return response.data;
};
