export const getRainfallPrediction = async () => {
  const response = await fetch("http://127.0.0.1:5000/rainfall_prediction");
  if (!response.ok) {
    throw new Error("Failed to fetch rainfall prediction");
  }
  return response.json();
};
