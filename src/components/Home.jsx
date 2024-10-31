import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import carousel1 from '../../public/Images/Carousel/Carousel-1.jpg';
import carousel2 from '../../public/Images/Carousel/Carousel-2.jpg';
import carousel3 from '../../public/Images/Carousel/Carousel-3.jpg';

const Home = () => (
  <Carousel>
    <Carousel.Item>
      <img src={carousel1} className="d-block w-100" alt="First slide" />
    </Carousel.Item>
    <Carousel.Item>
      <img src={carousel2} className="d-block w-100" alt="Second slide" />
    </Carousel.Item>
    <Carousel.Item>
      <img src={carousel3} className="d-block w-100" alt="Third slide" />
    </Carousel.Item>
  </Carousel>
);

export default Home;
