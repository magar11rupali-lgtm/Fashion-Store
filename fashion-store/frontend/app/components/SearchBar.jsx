'use client';

export default function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        />
        <span className="absolute left-4 top-3.5 text-xl">🔍</span>
      </div>
    </div>
  );
}