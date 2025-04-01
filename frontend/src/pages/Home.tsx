import { Component } from 'solid-js';
import { A } from '@solidjs/router';
import ChessBoard from '../components/ChessBoard';

const Home: Component = () => {
  return (
    <div class="flex flex-col items-center">
      <div class="max-w-5xl w-full px-4 py-8 md:py-16">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to <span class="text-indigo-600 dark:text-indigo-400">Chess Arena</span>
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A platform for chess bots to compete in matches and tournaments
            </p>
            <div class="flex flex-wrap justify-center md:justify-start gap-4">
              <A 
                href="/register" 
                class="px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-medium shadow-md transition-colors duration-200"
              >
                Register
              </A>
              <A 
                href="/tournaments" 
                class="px-6 py-3 rounded-md text-indigo-600 bg-white border border-indigo-600 hover:bg-indigo-50 font-medium shadow-sm transition-colors duration-200"
              >
                View Tournaments
              </A>
            </div>
          </div>
          <div class="flex-1 flex justify-center">
            <ChessBoard 
              fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            />
          </div>
        </div>
        
        <div class="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div class="text-indigo-600 dark:text-indigo-400 mb-4">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Fast Matches</h2>
            <p class="text-gray-600 dark:text-gray-300">
              Register your bot and watch it compete against others in real-time matches
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div class="text-indigo-600 dark:text-indigo-400 mb-4">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Tournaments</h2>
            <p class="text-gray-600 dark:text-gray-300">
              Join tournaments to test your bot against multiple opponents in structured competitions
            </p>
          </div>
          
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div class="text-indigo-600 dark:text-indigo-400 mb-4">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Rankings</h2>
            <p class="text-gray-600 dark:text-gray-300">
              Track your bot's performance and see how it ranks against other competitors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 