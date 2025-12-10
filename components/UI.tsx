import React from 'react';
import { AppState } from '../types';

interface UIProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

const UI: React.FC<UIProps> = ({ appState, setAppState }) => {
  const isTree = appState === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
      
      {/* Header */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left transition-opacity duration-1000">
        <h1 className="text-4xl md:text-6xl font-serif text-arix-gold tracking-widest uppercase drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]">
          Arix
        </h1>
        <p className="text-xs md:text-sm text-arix-gold/70 font-sans tracking-[0.3em] mt-2 uppercase border-t border-arix-gold/30 pt-2 w-full max-w-[200px]">
          Signature Collection
        </p>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-col items-center pointer-events-auto gap-4 mb-8">
         <div className="flex items-center gap-4">
             <span className={`text-xs tracking-widest text-arix-gold font-sans transition-opacity duration-500 ${isTree ? 'opacity-50' : 'opacity-100'}`}>
                 ETHEREAL
             </span>
             
             <button
                onClick={() => setAppState(isTree ? AppState.SCATTERED : AppState.TREE_SHAPE)}
                className="group relative w-16 h-16 rounded-full border border-arix-gold/30 bg-arix-dark/50 backdrop-blur-md flex items-center justify-center transition-all duration-700 hover:border-arix-gold hover:shadow-[0_0_30px_rgba(197,160,89,0.3)]"
             >
                <div className={`w-2 h-2 bg-arix-gold rounded-full transition-all duration-700 ${isTree ? 'scale-[4] opacity-20' : 'scale-100'}`} />
                <div className={`absolute inset-0 border border-arix-gold/50 rounded-full scale-0 transition-transform duration-500 ${isTree ? 'scale-100' : 'scale-0'}`} />
             </button>

             <span className={`text-xs tracking-widest text-arix-gold font-sans transition-opacity duration-500 ${!isTree ? 'opacity-50' : 'opacity-100'}`}>
                 ASSEMBLED
             </span>
         </div>
         
         <p className="text-arix-gold/50 font-serif italic text-sm mt-4">
             {isTree ? "Experience the Form" : "Experience the Void"}
         </p>

         {/* Spotify Playlist Button */}
         {/* Uses delay to wait for tree assembly animation (approx 1.5s) */}
         <a 
            href="https://open.spotify.com/playlist/1KDnikK92sl641o947RhPe?si=4f816b04081249f7"
            target="_blank"
            rel="noopener noreferrer"
            className={`
                mt-8 px-8 py-3 
                bg-arix-green/80 border border-arix-gold/40
                text-arix-gold font-sans tracking-[0.2em] text-xs uppercase
                hover:bg-arix-green hover:border-arix-gold hover:shadow-[0_0_20px_rgba(197,160,89,0.4)]
                transition-all duration-1000 ease-out
                ${isTree ? 'opacity-100 translate-y-0 delay-1000' : 'opacity-0 translate-y-4 pointer-events-none'}
            `}
         >
             the orbit we share
         </a>
      </div>
      
      {/* Footer / Credits */}
      <div className="absolute bottom-8 right-8 hidden md:block text-right">
          <p className="text-[10px] text-arix-gold/30 font-sans tracking-widest">
              INTERACTIVE 3D EXPERIENCE
          </p>
      </div>

    </div>
  );
};

export default UI;
