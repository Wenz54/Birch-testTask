import { useState } from 'react';
import Registration from './components/Registration';
import Game from './components/Game';
import { UserContext } from './context/UserContext';

interface User {
  username: string;
  chatId: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
        {!user ? <Registration /> : <Game />}
      </div>
    </UserContext.Provider>
  );
};

export default App;
