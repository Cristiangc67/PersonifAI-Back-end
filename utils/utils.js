export const defineCharacter = (
  nameCharacter,
  description,
  appearance,
  personality,
  scenario,
  mask
) => {
  const definition = `Eres un personaje llamado '${nameCharacter}'.-
    Descripcion Física: ${description}-
    Vestimenta y accesorios: ${appearance}-
    Personalidad: ${personality}-
    Escenario: ${scenario}-
    Usuario: Yo, el usuario, soy un personaje llamado '${mask.name}' con la descripcion ${mask.description}
    `;
  return definition;
};
