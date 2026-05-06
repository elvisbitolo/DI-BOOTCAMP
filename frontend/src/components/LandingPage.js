import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Users, Star, MessageCircle, Shield } from 'lucide-react';

const LandingPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const translations = {
    en: {
      title: 'Gikomba Delivery System',
      subtitle: 'Connecting Sellers with Trusted Riders',
      tagline: 'Fast, reliable delivery solutions for Gikomba market',
      sellerTitle: 'For Sellers',
      sellerDesc: 'Post your delivery orders and connect with available riders instantly',
      riderTitle: 'For Riders', 
      riderDesc: 'Find delivery opportunities and earn money delivering goods',
      featuresTitle: 'Why Choose Us?',
      feature1: 'Real-time Chat',
      feature2: 'Verified Users',
      feature3: 'Rating System',
      feature4: 'Email Notifications',
      getStarted: 'Get Started',
      login: 'Login',
      signup: 'Sign Up'
    },
    sw: {
      title: 'Mfumo wa Uwasilishaji wa Gikomba',
      subtitle: 'Kuunganisha Wauzaji na Wapanda Baiskeli Wanaoaminika',
      tagline: 'Suluhu za uwasilishaji za haraka na za kuaminika kwa soko la Gikomba',
      sellerTitle: 'Kwa Wauzaji',
      sellerDesc: 'Pia oda zako za uwasilishaji na uunganishe na wapanda baiskeli waliopo papo hapo',
      riderTitle: 'Kwa Wapanda Baiskeli',
      riderDesc: 'Pata fursa za uwasilishaji na pesa za kujitengeneza kwa kutoa bidhaa',
      featuresTitle: 'Kwa Nini Kutuchagua?',
      feature1: 'Mazungumzo ya Wakati Halisi',
      feature2: 'Watumiaji Walioidhinishwa',
      feature3: 'Mfumo wa Ukadiriaji',
      feature4: 'Arifa za Barua pepe',
      getStarted: 'Anza',
      login: 'Ingia',
      signup: 'Jisajili'
    }
  };

  const t = translations[selectedLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="navbar">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-800">{t.title}</span>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
            <Link to="/login" className="btn-secondary">
              {t.login}
            </Link>
            <Link to="/signup" className="btn-primary">
              {t.signup}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {t.title}
          </h1>
          <p className="text-2xl text-green-600 mb-4">{t.subtitle}</p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.tagline}
          </p>
          <Link to="/signup" className="btn-primary text-lg px-8 py-3">
            {t.getStarted}
          </Link>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <Package className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t.sellerTitle}</h3>
              <p className="text-gray-600 mb-6">{t.sellerDesc}</p>
              <Link to="/signup?userType=seller" className="btn-primary">
                Register as Seller
              </Link>
            </div>
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <Truck className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t.riderTitle}</h3>
              <p className="text-gray-600 mb-6">{t.riderDesc}</p>
              <Link to="/signup?userType=rider" className="btn-primary">
                Register as Rider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            {t.featuresTitle}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MessageCircle className="h-12 w-12 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{t.feature1}</h4>
              <p className="text-gray-600">Real-time chat with buyers and sellers</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{t.feature2}</h4>
              <p className="text-gray-600">Verified users for secure transactions</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Star className="h-12 w-12 text-yellow-500" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{t.feature3}</h4>
              <p className="text-gray-600">Built-in rating and review system</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{t.feature4}</h4>
              <p className="text-gray-600">Instant email notifications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Gikomba Delivery System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
