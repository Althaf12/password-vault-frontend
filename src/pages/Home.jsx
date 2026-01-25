import Header from '../components/Header';
import Footer from '../components/Footer';
import PasswordList from '../components/PasswordList';
import AddPasswordForm from '../components/AddPasswordForm';
import './Home.css';

function Home() {
  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="page-title">Welcome to Your Password Vault</h1>
          <p className="page-subtitle">Securely manage all your passwords in one place</p>
          <PasswordList />
          <AddPasswordForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
