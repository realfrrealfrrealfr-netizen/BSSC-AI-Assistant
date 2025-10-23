import { useState } from 'react';

// --- Navigation Links Data ---
const navLinks = [
  { name: 'bssc.live', url: 'https://bssc.live' },
  { name: 'BSSC Project Github', url: 'https://github.com/HaidarIDK/Binance-Super-Smart-Chain' },
  { name: 'X Page', url: 'https://x.com/bnbsolfork' },
  { name: 'BSSC Explorer', url: 'https://explorer.bssc.live' },
];

// --- Header Component ---
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-gray-950 border-b border-cyan-800 shadow-xl fixed top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <h1 className="text-xl font-extrabold text-cyan-400 tracking-wider">
          BSSC AI Explorer
        </h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 transition duration-150 font-medium text-sm"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-300 hover:text-cyan-400 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {/* Hamburger Icon (Using SVG for professional look) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-gray-900 border-t border-cyan-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-start">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium transition duration-150 w-full text-left"
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

// --- Footer Component ---
const Footer = () => (
  <footer className="mt-12 w-full border-t border-gray-700 pt-4 pb-2 text-center text-sm text-gray-500 bg-gray-950">
    <p>&copy; 2025 BSSC Project. All Rights Reserved.</p>
    <p>Architecture powered by Vercel Serverless and Gemini.</p>
  </footer>
);


// --- Main Application Component ---
export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Sends the user query to the Vercel API route.
   */
  async function handleAsk() {
    if (!input.trim()) {
        setResponse("Error: Please provide your query to begin the analysis.");
        return;
    }

    setLoading(true);
    setResponse('');

    try {
      // Fetch directly from the /api route, which Vercel will map to api/analyze.js
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      
      if (data.error) {
         setResponse(`Serverless Function Error: ${data.error}`);
      } else {
         setResponse(data.answer || 'Error: Could not retrieve a response. Check the Vercel logs for details.');
      }
      
    } catch (err) {
      console.error('Frontend Fetch Error:', err);
      // This error indicates the serverless function might not be deployed/running locally
      setResponse('Critical Error: Failed to connect to the analysis service. Ensure the Vercel serverless function is live.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-between pt-24 pb-8 font-sans">
      <Header />
      
      <div className="flex flex-col items-center w-full px-4">
        <div 
          className="w-full max-w-xl bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 transition duration-500 shadow-cyan-900/40 hover:shadow-cyan-500/50"
          style={{ transition: 'box-shadow 0.3s ease-in-out' }}
        >
          <h1 className="text-3xl font-extrabold mb-2 text-center text-cyan-400">
            AI Assistant
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Enter a BSSC Testnet query or any general question below.
          </p>

          {/* Query Input Area */}
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Enter BSSC address, transaction hash, or general query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 placeholder:text-gray-500"
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={!input.trim() || loading}
              className="w-full px-4 py-3 bg-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/30 hover:bg-cyan-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Data...
                </>
              ) : (
                'Get Professional Analysis'
              )}
            </button>
          </div>

          {/* Response Area - Constrained Height */}
          {response && (
            <div className="mt-8 bg-gray-800 border border-cyan-800 rounded-xl p-5 shadow-inner">
              <h2 className="text-xl font-bold mb-3 text-green-400 border-b border-gray-700 pb-2">Analysis Result:</h2>
              <div 
                className="text-gray-200 text-base leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto"
                // Crucial for preventing text overflow outside the screen
                style={{ maxHeight: '384px' }}
              >
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

