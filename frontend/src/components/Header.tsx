import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/userSlice';

const Header = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">SmartBrief</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Credits:</span>
              <span className="font-semibold text-blue-600">{user?.credits}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Role:</span>
              <span className="font-medium capitalize text-gray-700">{user?.role}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Welcome,</span>
              <span className="font-medium text-gray-700">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 