import './icon.css';

export default function Icon(){
    const handleClick = () => {
        window.location.href = '/'; // Redirect to home page
    };

    return(
        <div className="icon-bg" onClick={handleClick} style={{ cursor: 'pointer' }}>
        </div>
    );
}