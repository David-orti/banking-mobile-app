import React from "react";

const Main: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <section className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Bienvenido a mi Banco
        </h1>

        <p className="text-gray-600 text-lg">
          Este es el contenido principal del sitio. Aquí puedes añadir
          componentes, botones, imágenes o cualquier otra sección que quieras
          mostrar.
        </p>
      </section>
    </main>
  );
};

export default Main;
