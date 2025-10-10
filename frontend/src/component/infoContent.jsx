import React from 'react';


function VideoPlayer() {
  return (
    <video width="380" autoPlay={false} height="260" loop={true} controls>
      <source src="/Fest.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export default function InfoContent() {
  return (
    <>
      <h1>About Chaitanya 1.0</h1>
      <br/>
      <VideoPlayer className='justify-center self-center'/> <br/>
      <p>
        Chaitanya is the annual techno-cultural fest of HPTU.
        It's a vibrant celebration of talent, innovation, and creativity,
        bringing together students from across the region for a series of exciting
        events, competitions, and performances.
      </p>
    </>
  );
}