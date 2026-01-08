export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-600">
      <div className="text-center text-white px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Welcome to Fashion Store
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Discover Your Style
        </p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
          Shop Now
        </button>
      </div>
    </section>
  );
}