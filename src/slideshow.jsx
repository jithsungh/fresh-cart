import React from "react";
import "./styles/slideshow.css";

const Slideshow = () => {
  return (
    <main>
      <div
        className="slider"
        style={{
          "--width": "700px",
          "--height": "350px",
          "--quantity": "4",
        }}
      >
        <div className="slider-list">
          <div className="item" style={{ "--position": 1 }}>
            <img src="home-image-1.png" alt="Slide 1" />
          </div>
          <div className="item" style={{ "--position": 2 }}>
            <img src="home-image-2.png" alt="Slide 2" />
          </div>
          <div className="item" style={{ "--position": 3 }}>
            <img src="home-image-3.png" alt="Slide 3" />
          </div>
          <div className="item" style={{ "--position": 4 }}>
            <img src="home-image-4.PNG" alt="Slide 4" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Slideshow;
