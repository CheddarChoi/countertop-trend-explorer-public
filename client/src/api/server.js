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
