module.exports.evaluateMCQ = ({ selectedOption, correctAnswer }) => {
  if (selectedOption === undefined || correctAnswer === undefined) {
    throw new Error("selectedOption and correctAnswer are required");
  }

  const normalizedSelected =
    typeof selectedOption === "string" ? selectedOption.trim() : selectedOption;

  const normalizedCorrect =
    typeof correctAnswer === "string" ? correctAnswer.trim() : correctAnswer;

  const isCorrect = selectedOption === correctAnswer;

  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
  };
};
