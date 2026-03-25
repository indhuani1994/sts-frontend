import React from "react";


export default function NotFoundPage() {
  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="notfound-container" > 
      <div className="notfound-card">
        <div className="icon">⚠️</div>

        <h1 className="code">404</h1>
        <h2 className="title">Page Not Found</h2>

        <p className="description">
          The page you are looking for might have been removed, renamed,
          or temporarily unavailable.
        </p>

        <button className="home-btn" onClick={goHome}>
          Go Back Home
        </button>
      </div>

      <style>{`

      .notfound-container{
        height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
      
        font-family:Arial, Helvetica, sans-serif;
      }

      .notfound-card{
       
        padding:50px 60px;
        border-radius:12px;
        text-align:center;
        animation:fadeIn 0.6s ease;
      }

      .icon{
        font-size: 130px;
        margin-bottom:10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2), 4px 4px 8px rgba(161, 192, 21, 0.2);

      }

      .code{
        font-size:100px;
        margin:0;
        color:#333;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }

      .title{
        margin-top:10px;
        color:#444;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        font-size:50px;

      }

      .description{
        margin-top:10px;
        color:#777;
        max-width:600px;
        font-size:20px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }

      @media (max-width:768px){
.icon{
        font-size: 70px;

      }
    .code{
        font-size:80px;
      }
 .title{ 
  font-size: 30px;
 }
.description {
 font-size: 16px;

}

      }

      .home-btn{
        margin-top:25px;
        padding:12px 25px;
        border:none;
        background:#4f46e5;
        color:white;
        font-size:16px;
        border-radius:6px;
        cursor:pointer;
        transition:all 0.3s ease;
      }

      .home-btn:hover{
        background:#4338ca;
        transform:translateY(-2px);
      }

      @keyframes fadeIn{
        from{
          opacity:0;
          transform:translateY(20px);
        }
        to{
          opacity:1;
          transform:translateY(0);
        }
      }

      `}</style>
    </div>
  );
}
