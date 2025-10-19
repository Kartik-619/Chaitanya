import React from 'react';

export default function AboutContent() {
  return (
    <>
      <h1>About Us</h1>
      <br/>
      <p>
        Established in 2010, HPTU is nestled in the scenic hills of Hamirpur, Himachal Pradesh. 
        With over 40 affiliated colleges and a main campus in Hamirpur, it drives societal progress 
        through technical education, research, and innovation.
      </p>
   
     
      <p className='website-link'>
        👉 Visit the official website: {' '}
        <a href='https://www.himtu.ac.in/' target="_blank" rel="noopener noreferrer">HPTU</a>
      </p>
    </>
  );
}