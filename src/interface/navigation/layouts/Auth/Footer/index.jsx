import React from "react";

function Footer({ ...props }) {
  return (
    <footer className='footer'>
      <div className='container'>
        <div className='left'>
         
        </div>
        <p className='right'>
          <span>
            <a href="https://www.mitc.vn/">
              Công ty Cổ phần Tập đoàn Minh Tuệ &copy; {1900 + new Date().getYear()}{" "}
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
