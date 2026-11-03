const ai = require("../config/gemini");

const MODEL = "gemini-3.5-flash-lite";

const generateAIText = async (prompt) => {
  const startTime = Date.now();

  try {
    const interaction = await ai.interactions.create({
      model: MODEL,
      input: prompt,
      store: false,
    });

    console.log(`Gemini response time: ${Date.now() - startTime}ms`);

    if (!interaction.output_text) {
      throw new Error("Empty AI response");
    }

    return interaction.output_text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);

    const aiError = new Error("AI service is temporarily unavailable");

    aiError.statusCode = 502;

    throw aiError;
  }
};

module.exports = generateAIText;
