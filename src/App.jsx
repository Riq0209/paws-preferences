import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import "./App.css";


const API_URL = "https://cataas.com/cat?json=true";
const API_CATS_URL = "https://cataas.com/api/cats?limit=20"; // Reduced for faster response
const PRELOAD_BUFFER = 5; // Number of images to preload ahead

function CatCard({ cat, onSwipe, onRefresh }) {
  const [{ x, rot }, api] = useSpring(() => ({ x: 0, rot: 0 }));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardLimit = 180; // px, max drag before edge

  const bind = useDrag(({ down, movement: [mx], velocity, direction: [dx] }) => {
    // Limit drag to cardLimit
    const limitedMx = Math.max(-cardLimit, Math.min(cardLimit, mx));
    
    // Show indicators only when actively dragging with some movement
    setIsDragging(down && Math.abs(mx) > 20);
    
    if (!down && (velocity > 0.2 || Math.abs(mx) > cardLimit)) {
      // If released fast enough or dragged far enough -> swipe away
      const dir = dx > 0 || mx > cardLimit / 2 ? "right" : "left";
      // Hide indicators when swipe completes
      setIsDragging(false);
      // Immediately call onSwipe for instant cat change
      onSwipe(dir);
      // Then start animation with immediate: true for instant snap
      api.start({ x: dx * 500 || (mx > 0 ? 500 : -500), rot: dx * 15 || (mx > 0 ? 15 : -15), immediate: true });
    } else {
      // While dragging, limit to cardLimit
      api.start({ x: down ? limitedMx : 0, rot: down ? limitedMx / 20 : 0, immediate: down });
    }
  });

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4 max-w-sm sm:max-w-md mx-auto">
      <animated.div
        {...bind()}
        className="bg-white rounded-xl shadow-lg p-3 sm:p-4 flex flex-col items-center w-full cursor-grab active:cursor-grabbing relative"
        style={{
          x,
          rotate: rot,
          touchAction: "none",
        }}
      >
        {/* Swipe Indicators - Only show when actively dragging */}
        {isDragging && (
          <animated.div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            style={{
              opacity: x.to(val => Math.abs(val) > 50 ? Math.min(Math.abs(val) / 100, 0.8) : 0)
            }}
          >
            <animated.div 
              className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-2"
              style={{
                opacity: x.to(val => val > 50 ? 1 : 0),
                transform: x.to(val => val > 50 ? 'scale(1)' : 'scale(0.8)')
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              LIKE
            </animated.div>
            <animated.div 
              className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-2"
              style={{
                opacity: x.to(val => val < -50 ? 1 : 0),
                transform: x.to(val => val < -50 ? 'scale(1)' : 'scale(0.8)')
              }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              PASS
            </animated.div>
          </animated.div>
        )}

        <img
          src={`https://cataas.com/cat/${cat.id}`}
          alt="Cat"
          className="rounded-lg w-full h-48 sm:h-56 md:h-64 object-cover mb-3 sm:mb-4"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          style={{ 
            opacity: imageLoaded ? 1 : 0.7,
            transition: 'opacity 0.2s ease'
          }}
        />
      </animated.div>
      
      {/* Swipe Instructions */}
      <div className="flex justify-between items-center w-full mt-2 mb-4 px-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>👈</span>
          <span>Swipe left to pass</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Swipe right to like</span>
          <span>👉</span>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 sm:gap-6 md:gap-10 mt-4 sm:mt-6 w-full">
        <button
          aria-label="Refresh"
          className="bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-600 rounded-full p-3 sm:p-4 shadow-lg transform transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 active:shadow-md"
          onClick={() => onRefresh()}
        >
          {/* Refresh icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-150">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.001 7.001 0 0112 5c1.657 0 3.156.576 4.318 1.535M18.418 15A7.001 7.001 0 0112 19c-1.657 0-3.156-.576-4.318-1.535" />
          </svg>
        </button>
        <button
          aria-label="Dislike"
          className="bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-600 rounded-full p-3 sm:p-4 shadow-lg transform transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 active:shadow-md"
          onClick={() => onSwipe('left')}
        >
          {/* X icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-150">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          aria-label="Like"
          className="bg-pink-100 hover:bg-pink-200 active:bg-pink-300 text-pink-600 rounded-full p-3 sm:p-4 shadow-lg transform transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 active:shadow-md"
          onClick={() => onSwipe('right')}
        >
          {/* Heart icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-150">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  );

  
}

function App() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [currentCat, setCurrentCat] = useState(null);
  const [likedCats, setLikedCats] = useState([]);
  const [currentRoute, setCurrentRoute] = useState('home'); // 'home' or 'favorites'
  const [catIndex, setCatIndex] = useState(0); // Track current position in cats array
  const [preloadedImages, setPreloadedImages] = useState(new Set()); // Track preloaded images

  // Set document title
  useEffect(() => {
    document.title = 'CATinder';
  }, []);

  useEffect(() => {
    async function fetchCats() {
      setLoading(true);
      setLoadingProgress(10);
      
      try {
        // Fetch cat list
        setLoadingProgress(30);
        const res = await fetch(API_CATS_URL);
        const catList = await res.json();
        setCats(catList);
        setCurrentCat(catList[0]);
        setCatIndex(0);
        setLoadingProgress(50);
        
        // Preload first batch of images with progress tracking
        const preloadBatch = catList.slice(0, PRELOAD_BUFFER);
        let loadedCount = 0;
        
        const preloadPromises = preloadBatch.map((cat, index) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              loadedCount++;
              const progress = 50 + (loadedCount / preloadBatch.length) * 40;
              setLoadingProgress(progress);
              setPreloadedImages(prev => new Set([...prev, cat.id]));
              resolve();
            };
            img.onerror = () => {
              loadedCount++;
              const progress = 50 + (loadedCount / preloadBatch.length) * 40;
              setLoadingProgress(progress);
              resolve();
            };
            img.src = `https://cataas.com/cat/${cat.id}`;
          });
        });
        
        await Promise.all(preloadPromises);
        setLoadingProgress(100);
        
        // Small delay to show completion
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Failed to fetch cats:', error);
        setLoadingProgress(30);
        
        // Fallback to individual cat fetch
        const catList = [];
        for (let i = 0; i < 10; i++) {
          try {
            const res = await fetch(API_URL);
            const data = await res.json();
            catList.push(data);
            setLoadingProgress(30 + (i / 10) * 60);
          } catch (err) {
            console.error('Failed to fetch individual cat:', err);
          }
        }
        setCats(catList);
        setCurrentCat(catList[0]);
        setCatIndex(0);
        
        // Preload fallback images
        preloadImages(catList.slice(0, PRELOAD_BUFFER));
        setLoadingProgress(100);
        
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }
    fetchCats();
  }, []);

  // Preload images function
  const preloadImages = (catsToPreload) => {
    catsToPreload.forEach(cat => {
      if (!preloadedImages.has(cat.id)) {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, cat.id]));
        };
        img.src = `https://cataas.com/cat/${cat.id}`;
      }
    });
  };

  // Auto-fetch more cats when running low (optimized)
  useEffect(() => {
    const fetchMoreCats = async () => {
      if (catIndex >= cats.length - 5 && cats.length > 0) { // Trigger earlier (5 left instead of 10)
        try {
          const res = await fetch(API_CATS_URL);
          const newCats = await res.json();
          setCats(prev => [...prev, ...newCats]);
          
          // Preload next batch of images
          preloadImages(newCats.slice(0, PRELOAD_BUFFER));
        } catch (error) {
          console.error('Failed to fetch more cats:', error);
        }
      }
    };
    fetchMoreCats();
  }, [catIndex, cats.length]);

  // Preload upcoming images as user progresses
  useEffect(() => {
    if (cats.length > 0) {
      const upcomingCats = cats.slice(catIndex + 1, catIndex + 1 + PRELOAD_BUFFER);
      preloadImages(upcomingCats);
    }
  }, [catIndex, cats]);

  const handleRefresh = () => {
    // Instantly move to next cat from pre-fetched array
    const nextIndex = catIndex + 1;
    if (nextIndex < cats.length) {
      setCatIndex(nextIndex);
      setCurrentCat(cats[nextIndex]);
    } else {
      // If we've exhausted the array, restart from beginning
      setCatIndex(0);
      setCurrentCat(cats[0]);
    }
  };

  const handleSwipe = async (direction) => {
    if (direction === 'right') {
      setLikeCount((prev) => prev + 1);
      // Add current cat to liked cats
      if (currentCat) {
        setLikedCats((prev) => [...prev, currentCat]);
      }
      // Refresh to next cat for likes
      handleRefresh();
    } else if (direction === 'left') {
      setDislikeCount((prev) => prev + 1);
      // Also refresh for dislikes to keep flow fast
      handleRefresh();
    }
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto flex flex-col items-center bg-gradient-to-br from-pink-200 to-indigo-200 overflow-x-hidden relative">
      {loading ? (
        // Loading Screen
        <div className="flex-1 flex flex-col items-center justify-center w-full px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">CATinder</h1>
            <p className="text-lg text-gray-600">Finding the purr-fect cats for you...</p>
          </div>
          
          {/* Animated Cat Loading Icon */}
          <div className="mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center animate-bounce">
                {/* Cat Face Icon */}
                <div className="text-4xl">🐱</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mb-4">
            <div className="bg-white bg-opacity-50 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">{Math.round(loadingProgress)}%</p>
          </div>

          {/* Loading Messages */}
          <div className="text-center">
            {loadingProgress < 30 && (
              <p className="text-sm text-gray-600 animate-pulse">🐱 Connecting to cat database...</p>
            )}
            {loadingProgress >= 30 && loadingProgress < 50 && (
              <p className="text-sm text-gray-600 animate-pulse">📸 Fetching adorable cats...</p>
            )}
            {loadingProgress >= 50 && loadingProgress < 90 && (
              <p className="text-sm text-gray-600 animate-pulse">🖼️ Preloading cat photos...</p>
            )}
            {loadingProgress >= 90 && (
              <p className="text-sm text-gray-600 animate-pulse">✨ Almost ready to swipe!</p>
            )}
          </div>
        </div>
      ) : (
        // Main App Content
        <>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 mt-8 sm:mt-12 text-gray-800 px-4">CATinder</h1>
          
          <div className="flex-1 flex flex-col w-full pb-20">
        {currentRoute === 'favorites' ? (
          // Favorites Route - Show Liked Cats
          <div className="w-full max-w-md px-3 sm:px-4 pt-4 mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Liked Cats: {likedCats.length}</h2>
            </div>
            
            {likedCats.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-center">
                <div className="text-xl text-gray-500">
                  No liked cats yet! Go to Meow and start swiping! 
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {likedCats.map((cat, index) => (
                  <div key={`${cat.id}-${index}`} className="bg-white rounded-lg shadow-lg p-3">
                    <img
                      src={`https://cataas.com/cat/${cat.id}`}
                      alt={`Liked cat ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Home Route - Main Swiping Page
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full flex justify-center px-4">
              {loading ? (
                <div className="text-xl">Loading cats...</div>
              ) : currentCat ? (
                <CatCard cat={currentCat} onSwipe={handleSwipe} onRefresh={handleRefresh} />
              ) : (
                <div className="text-xl">No cats available! 🐾</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white backdrop-blur-md shadow-2xl">
        <div className="flex w-full relative border-t border-gray-100">
          {/* Active tab indicator */}
          <div 
            className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all duration-300 ease-in-out ${
              currentRoute === 'favorites' ? 'w-1/2 translate-x-full' : 'w-1/2 translate-x-0'
            }`}
          />
          
          <button 
            className={`flex-1 flex flex-col items-center py-4 px-6 transition-all duration-300 ease-in-out relative ${
              currentRoute === 'home'
                ? 'text-red-500' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setCurrentRoute('home')}
          >
            <div className={`transition-all duration-300 ${currentRoute === 'home' ? 'scale-110' : 'scale-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-6 h-6 mb-1">
                <path d="M64 96c53 0 96 43 96 96l0 85.8c29.7-44.7 77.8-76.2 133.4-84 25.6 60 85.2 102.1 154.6 102.1 10.9 0 21.6-1.1 32-3.1L480 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-140.8-136 108.8 56 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-144 0c-53 0-96-43-96-96l0-224c0-16.6-12.6-30.2-28.7-31.8l-6.6-.3C44.6 158.2 32 144.6 32 128 32 110.3 46.3 96 64 96zM533.8 3.2C544.2-5.5 560 1.9 560 15.5L560 128c0 61.9-50.1 112-112 112S336 189.9 336 128l0-112.5c0-13.6 15.8-21 26.2-12.3L416 48 480 48 533.8 3.2zM400 108a20 20 0 1 0 0 40 20 20 0 1 0 0-40zm96 0a20 20 0 1 0 0 40 20 20 0 1 0 0-40z"/>
              </svg>
            </div>
            <span className={`text-xs font-semibold transition-all duration-300 ${currentRoute === 'home' ? 'text-red-600' : 'text-gray-400'}`}>
              Meow
            </span>
            {/* Active dot indicator */}
            {currentRoute === 'home' && (
              <div className="absolute -bottom-1 w-1 h-1 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          
          <button 
            className={`flex-1 flex flex-col items-center py-4 px-6 transition-all duration-300 ease-in-out relative ${
              currentRoute === 'favorites'
                ? 'text-pink-500' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setCurrentRoute('favorites')}
          >
            <div className={`relative transition-all duration-300 ${currentRoute === 'favorites' ? 'scale-110' : 'scale-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill={currentRoute === 'favorites' ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              {likeCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {likeCount > 99 ? '99+' : likeCount}
                </span>
              )}
            </div>
            <span className={`text-xs font-semibold transition-all duration-300 ${currentRoute === 'favorites' ? 'text-pink-600' : 'text-gray-400'}`}>
              Favorites
            </span>
            {/* Active dot indicator */}
            {currentRoute === 'favorites' && (
              <div className="absolute -bottom-1 w-1 h-1 bg-pink-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </nav>
        </>
      )}
    </div>
  );
}

export default App;
