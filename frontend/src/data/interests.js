export const availableInterests = [

  "Arte", "Pintura", "Escultura", "Arquitectura", "Diseño",
  "Música", "Música clásica", "Jazz", "Rock", "Hip Hop",
  "Tecnología", "Programación", "Idiomas",
  "Ciencia", "Astronomía", "Psicología", "Filosofía",
  "Deportes", "Fitness", "Yoga", "Baile",
  "Política", "Economía", "Negocios", "Historia", "Voluntariado",
  "Otros"
];
export const categoryColors = {
  "Todos": "linear-gradient(135deg, #ff8cc8, #ffffff)",
  "Arte": "linear-gradient(-150deg, #ff8cc8, #826eac)", 
  "Música": "linear-gradient(135deg, #87c8b4, #549f72)", 
  "Tecnología": "linear-gradient(100deg, #6eac99, #b668cd)", 
  "Ciencia": "linear-gradient(135deg, #899cd4, #ac63eb)", 
  "Deportes": "linear-gradient(-1000deg, #826eac, #a2a0a0)",
  "Sociedad": "linear-gradient(135deg, #7a0ac4, #a4d4ff)", // Naranja oscuro
  "Otros": "linear-gradient(140deg, #9bc9ed, #dfe6e9)" // Gris claro
};


export const categorizedInterests = {
  "Todos":["Arte", "Pintura", "Escultura", "Arquitectura", "Diseño", "Música", "Música clásica", "Jazz", "Rock", "Hip Hop", "Tecnología", "Programación", "Idiomas", "Ciencia", "Astronomía", "Psicología", "Filosofía", "Deportes", "Fitness", "Yoga", "Baile", "Política", "Economía", "Negocios", "Historia", "Voluntariado", "Otros"],
  "Arte":  ["Arte", "Pintura", "Escultura", "Arquitectura", "Diseño"],
  "Música":  ["Música", "Música clásica", "Jazz", "Rock", "Hip Hop"],
  "Tecnología":  ["Tecnología", "Programación", "Idiomas"],
  "Ciencia":  ["Ciencia", "Astronomía", "Psicología", "Filosofía"],
  "Deportes": ["Deportes", "Fitness", "Yoga", "Baile"],
  "Sociedad":  ["Política", "Economía", "Negocios", "Historia", "Voluntariado"],

  "Otros":availableInterests.filter(
      (interest) => ![
        "Arte", "Pintura", "Escultura", "Arquitectura", "Diseño",
        "Música", "Música clásica", "Jazz", "Rock", "Hip Hop",
        "Tecnología", "Programación", "Idiomas",
        "Ciencia", "Astronomía", "Psicología", "Filosofía",
        "Deportes", "Fitness", "Yoga", "Baile",
        "Política", "Economía", "Negocios", "Historia", "Voluntariado"
      ].includes(interest)),

};
