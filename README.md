<div align='center'><img src='https://i.pinimg.com/736x/41/fd/90/41fd908e2ca6d12b62bb206e137e76fc.jpg'/></div>

<h2>Screenshots of the Project 📸</h2>
<br>

<div align='center'>
<img src='./src/app/assets/images/webpage.png'/>

</div>
<div align='center'>
<img src='./src/app/assets/images/Angular_Movie_App-1024.jpeg'/>
<a href='http://angular-movie.s3-website.eu-north-1.amazonaws.com' target='_blank' > View Live App</a>
</div>
# 🎬 MovieFlix App(Angular)

MovieFlix is a modern, responsive web application built with Angular, designed to deliver a seamless and engaging experience for movie enthusiasts. It allows users to browse, search, and explore movie details, leveraging cutting-edge Angular features and optimizations for performance and scalability.

---

## Technologies used

- Technologies used
  - [Angular](https://angular.dev/overview) - A typescript based framework for web development
  - [SCSS](https://sass-lang.com/documentation/) - A stylesheet language that’s compiled to CSS.
  - [Typescript](https://www.typescriptlang.org/) - Strongly typed language for safe incontractly to using Javasript
  - [Jest](https://jestjs.io/)- A delightful JavaScript Testing Framework with a focus on simplicity.
  - [TestBed](https://angular.dev/api/core/testing/TestBed)- Configures and initializes environment for unit testing and provides methods for creating components and services in unit tests.
  - [Github-Actions](https://github.com/features/actions)-  (CI/CD) platform that allows you to automate your   build, test, and deployment pipeline
  - [Aws](https://aws.amazon.com/)- A comprehensive cloud computing platform offered by Amazon
- State-management

## 🚀 Features  

- **Lazy Loading**  
  Implements Angular's lazy loading for modules and components to reduce initial load times and improve performance by loading only the necessary resources on demand.

- **Dynamic UI Components**  
 Utilizes ngx-bootstrap and ngx-ui libraries to deliver reusable, responsive, and visually appealing UI elements such as modals, carousels, and tooltips.

  - **Routing Optimization**  
  Employs Angular Router with lazy-loaded routes to ensure fast navigation and efficient resource management.

- **Real-Time Search**  
  Integrates a search functionality powered by an external movie API (e.g., TMDB or OMDb) for fetching movie details dynamically.

- ⚡ **Responsive Design**  
  Built with Tailwind and custom CSS to ensure compatibility across devices, from mobile to desktop.

- 🎯 **Performance Enhancements**  
  - Ahead-of-Time (AOT) Compilation: Reduces bundle size and improves rendering speed.
  - Tree Shaking: Eliminates unused code to optimize the application bundle.
  - Change Detection Optimization: Leverages OnPush change detection strategy to minimize unnecessary DOM updates.

- 💫 **Custom Backend Integration**  
  A dedicated backend service dynamically sets environment variables (ie., API keys, endpoints) during application initialization for secure and flexible configuration.

---

## 🛠 Tech Stack

- **Framework**: Angular (vX)
- **State & Events**: RxJS, Observables
- **Animations**: Angular Animations API
- **HTTP**: Angular HttpClient
- **UI**: SCSS + Angular Component Styling
- **API**: [TMDB - The Movie Database](https://www.themoviedb.org/)

---

## Test

<img src="./src/app/assets/images/Screenshot 2025-06-03 at 08.45.57.png" width="600"/>

## Github Action (CI/CD)

Automate project build, test, and deployment pipeline

<img src="./src/app/assets/images/Screenshot 2025-06-03 at 08.52.18.png" width="900"/>

## 📦 Getting Started

First, run the development server:

1. Clone the project

```bash
git clone https://github.com/HoseaNganga/Angular-Movie-App.git
```

2. Install dependecies

```bash
npm install
```

3. Change directory

```bash
 cd Angular-movie-app
```

4. Run the application

```bash
ng serve
```

Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
