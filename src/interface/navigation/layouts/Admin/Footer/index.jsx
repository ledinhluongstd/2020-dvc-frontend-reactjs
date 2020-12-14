import React from "react";

function Footer({ ...props }) {
  return (
    <footer className='footer'>
      <div className='left'>
        MiTC
      </div>
      <p className='right'>
        <span>
          <a target='_blank' href="https://www.mitc.vn/">
            Công ty Cổ phần Tập đoàn Minh Tuệ &copy; {1900 + new Date().getYear()}{" "}
          </a>
        </span>
      </p>
    </footer>
  );
}

export default Footer;
