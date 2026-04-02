export default function Hero() {
  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-600">
      <div className="text-center text-white px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-3 sm:mb-4">
          Welcome to Fashion Store
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8">
          Discover Your Style
        </p>
        <button className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition-colors touch-manipulation">
           Shop Now
        </button>
      </div>
    </section>
  );
}