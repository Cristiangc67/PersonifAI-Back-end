import Character from "../models/character.model.js";
const authorizeCharacterOwner = async (req, res, next) => {
  try {
    const characterId = req.params.id;
    const userId = req.user.id;

    const character = await Character.findById(characterId);

    if (!character) {
      return res.status(404).json({ message: "Not found character" });
    }
    console.log(character.creator.toString());

    if (character.creator.toString() !== userId) {
      return res.status(403).json({ message: "Forbbiden" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export default authorizeCharacterOwner;
