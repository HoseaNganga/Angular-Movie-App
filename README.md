# 🎬 Movie Search App (Angular)

A high-performance, responsive movie search application built with **Angular**. This app leverages performance optimization techniques—including **debounced search**, **lazy loading**, and **smooth animations**—to deliver a seamless and efficient user experience.

---

## 🚀 Features  

- 🔍 **Debounced Search**  
  Improves performance and reduces API load by minimizing redundant requests as the user types.

- ⚙️ **Separated Backend API**  
  A custom backend handles authentication tokens, secure routes, and data fetching—allowing the frontend to stay lightweight and scalable.

  - 🔍 **Debounced Movie Search**  
  Reduces unnecessary API calls by debouncing input in the search bar for optimal performance.

- 🎞️ **Dynamic Carousels**  
  Custom horizontal scrolling carousels for movies and cast members.

- ⚡ **Performance Optimizations**  
  Includes lazy loading, memoization, conditional rendering, and optimized DOM updates.

- 🎯 **Angular Routing & Lifecycle Hooks**  
  Smooth in-app navigation with smart handling of scroll state, resets, and UI updates.

- 💫 **Elegant Animations**  
  Uses Angular animations to provide smooth fade transitions between states.

---

## 🛠 Tech Stack

- **Framework**: Angular (vX)
- **State & Events**: RxJS, Observables
- **Animations**: Angular Animations API
- **HTTP**: Angular HttpClient
- **UI**: SCSS + Angular Component Styling
- **API**: [TMDB - The Movie Database](https://www.themoviedb.org/)

---

## 📦 Installation

```bash
git clone https://github.com/your-username/movie-search-app.git
cd movie-search-app
npm install
ng serve
