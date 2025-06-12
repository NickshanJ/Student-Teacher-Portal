import { Player } from '@lottiefiles/react-lottie-player';
import successAnimation from '../assets/success.json'; // adjust path as needed

function SuccessModal() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg flex flex-col items-center shadow-xl">
        <Player
          autoplay
          loop={false}
          src={successAnimation}
          style={{ height: '200px', width: '200px' }}
        />
        <h2 className="text-2xl font-semibold mt-4 text-green-600">Password Reset Successful!</h2>
        <p className="text-gray-700 mt-2">Redirecting to login...</p>
      </div>
    </div>
  );
}

export default SuccessModal;