import React from 'react';
import carousel1 from '../../public/Images/Carousel/Carousel-1.jpg';
import carousel2 from '../../public/Images/Carousel/Carousel-2.jpg';
import carousel3 from '../../public/Images/Carousel/Carousel-3.jpg';

const Carousel = () => (
  <div className="logo">
    <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
      <ol className="carousel-indicators">
        <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active"></li>
        <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
        <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
      </ol>
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src={carousel1} className="d-block w-100" alt="First slide" />
        </div>
        <div className="carousel-item">
          <img src={carousel2} className="d-block w-100" alt="Second slide" />
        </div>
        <div className="carousel-item">
          <img src={carousel3} className="d-block w-100" alt="Third slide" />
        </div>
      </div>
      <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="sr-only">Previous</span>
      </a>
      <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="sr-only">Next</span>
      </a>
    </div>
  </div>
);

export default Carousel;
