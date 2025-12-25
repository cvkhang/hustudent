import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  MessageCircle,
  Search,
  Calendar,
  Star,
  Zap,
  ChevronRight,
  Play,
  CheckCircle2,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import Logo from '@/components/ui/Logo';

// --- Reusable Pro Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    { name: "Khám phá", href: "/explore" },
    { name: "Cộng đồng", href: "/groups" },
    { name: "Tính năng", href: "#features" },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-md rounded-full px-6 py-3 shadow-clay-btn border border-white/60 flex items-center justify-between transition-all hover:bg-white/90">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="md" />
          </div>

          <div className="hidden md:flex items-center gap-8 bg-clay-bg/50 px-8 py-2 rounded-full shadow-inner">
            {links.map(link => (
              <a key={link.name} href={link.href} className="font-bold text-slate-500 hover:text-primary-600 transition-colors text-sm uppercase tracking-wide">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="font-bold text-slate-600 hover:text-primary-600 px-4">
              Đăng nhập
            </Link>
            <Link to="/register">
              <ProButton variant="primary" className="!py-2.5 !px-6 !text-sm !rounded-xl shadow-none">
                Tham gia ngay
              </ProButton>
            </Link>
          </div>

          <button className="md:hidden text-slate-600 p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="absolute top-24 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/50 flex flex-col gap-4 animate-fade-in-up">
            {links.map(link => (
              <a key={link.name} href={link.href} className="font-bold text-xl text-slate-700 py-3 border-b border-dashed border-slate-200">
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/login" className="w-full">
                <ProButton variant="secondary" className="w-full">Đăng nhập</ProButton>
              </Link>
              <Link to="/register" className="w-full">
                <ProButton variant="primary" className="w-full">Đăng ký</ProButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="relative pt-44 pb-20 px-4 min-h-screen flex items-center overflow-hidden">
      {/* Background Animated Blobs - shifted for better composition */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-r from-primary-200 to-secondary-200 rounded-full blur-[100px] opacity-50 animate-morph mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full blur-[100px] opacity-50 animate-morph animation-delay-2000 mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Content - Strong Typography */}
        <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-white/60 shadow-clay-card-sm transition-transform hover:scale-105">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-green"></span>
            </span>
            <span className="text-sm font-extrabold text-slate-600 tracking-wide uppercase">Dành riêng cho sinh viên Bách Khoa</span>
          </div>

          <h1 className="text-6xl lg:text-[5.5rem] font-black text-slate-800 leading-[1.2] tracking-tight drop-shadow-sm">
            <span className="block text-primary-500">Kết nối.</span>
            <span className="block text-secondary-500">Học tập.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-red-500 pt-2">
              Phát triển.
            </span>
          </h1>

          <p className="text-xl text-slate-600 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Tìm study mate hợp gu, ôn thi cùng nhóm và chinh phục điểm A+ với kho tài liệu chất lượng nhất HUST.
          </p>


          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-4">
            <Link to="/register">
              <ProButton variant="primary" icon={ArrowRight} className="w-full sm:w-auto text-lg h-16 !px-10 shadow-glow-primary">
                Tham gia ngay
              </ProButton>
            </Link>
            <ProButton variant="ghost" icon={Play} className="w-full sm:w-auto text-lg h-16">
              Xem Demo
            </ProButton>
          </div>


          {/* User Avatars */}
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-6 border-t border-slate-200/50 mt-6 lg:mr-20">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-slate-200 hover:-translate-y-1 transition-transform">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 15}&backgroundColor=b6e3f4`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-slate-600 font-bold text-sm">
              <span className="text-primary-600 text-lg">500+</span> Nhóm học tập
            </p>
          </div>
        </div>

        {/* Right Visual - Cohesive Dashboard Mockup */}
        <div className="relative hidden lg:block h-[600px] w-full perspective-1000 pl-10">
          {/* Central App Preview Card */}
          <div className="absolute top-10 left-10 right-0 bottom-10 bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/80 shadow-clay-card flex flex-col p-6 animate-float-slow z-20">
            {/* Fake UI Header */}
            <div className="h-20 flex items-center justify-between px-2">
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="h-2 w-32 bg-slate-200 rounded-full"></div>
            </div>

            {/* Fake Feed Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-40 rounded-3xl bg-white shadow-sm p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100"></div>
                    <div className="w-24 h-3 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-20 bg-slate-50 rounded-2xl"></div>
                </div>
                <div className="h-24 rounded-3xl bg-accent-blue/10 border border-accent-blue/20"></div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-28 rounded-3xl bg-accent-orange/10 border border-accent-orange/20 p-4">
                  <div className="w-8 h-8 rounded-full bg-accent-orange/20 mb-3"></div>
                  <div className="w-full h-2 bg-accent-orange/20 rounded"></div>
                </div>
                <div className="h-32 rounded-3xl bg-white shadow-sm"></div>
              </div>
            </div>

            {/* Overlaid Floating Achievement Widgets */}
            <div className="absolute -right-8 top-20 animate-float z-30">
              <ClayCard className="!bg-white !p-4 !rounded-[1.5rem] flex items-center gap-3 w-56 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center font-bold">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Lịch học nhóm</p>
                  <p className="text-lg font-black text-slate-800">20:00 - Giải tích 1</p>
                </div>
              </ClayCard>
            </div>

            <div className="absolute -left-8 bottom-32 animate-float-delayed z-30">
              <ClayCard className="!bg-white !p-4 !rounded-[1.5rem] flex items-center gap-3 w-56 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center font-bold">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Study Goals</p>
                  <p className="text-lg font-black text-slate-800">Hoàn thành 8/10</p>
                </div>
              </ClayCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FeatureSection = () => {
  // FEATURES BASED ON HUSTUDENT CONTEXT: Group Study, Flashcards, Q&A, Connect
  const features = [
    {
      icon: Users,
      from: "from-accent-blue", to: "to-indigo-500",
      title: "Cộng Đồng Học Tập",
      desc: "Tìm bạn study mate, tham gia các nhóm học tập theo môn hoặc chuyên ngành. Cùng nhau tiến bộ."
    },
    {
      icon: Zap,
      from: "from-accent-purple", to: "to-fuchsia-500",
      title: "Flashcards & Quiz",
      desc: "Ôn tập hiệu quả với hàng ngàn bộ flashcards và quiz được chia sẻ từ cộng đồng sinh viên giỏi."
    },
    {
      icon: MessageCircle,
      from: "from-accent-orange", to: "to-red-500",
      title: "Hỏi Đáp Q&A",
      desc: "Thắc mắc bài tập khó? Đăng câu hỏi ngay để nhận lời giải chi tiết từ các 'cao thủ' HUST."
    },
    {
      icon: BookOpen,
      from: "from-accent-green", to: "to-emerald-500",
      title: "Chia Sẻ Tài Liệu",
      desc: "Kho đề thi, slide bài giảng và tài liệu ôn thi khổng lồ. Được sắp xếp khoa học, dễ dàng tìm kiếm."
    }
  ];

  return (
    <section id="features" className="py-32 px-4 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-800">
            Hệ Sinh Thái <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">Học Tập Số 1</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium">
            Không chỉ là mạng xã hội. Đây là vũ khí bí mật giúp bạn chinh phục mọi kỳ thi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <ClayCard key={idx} className="h-full p-8 flex flex-col items-center text-center gap-6 group hover:!bg-white hover:scale-105 transition-transform duration-300">
              <div className={`w-20 h-20 bg-gradient-to-br ${f.from} ${f.to} rounded-3xl shadow-lg flex items-center justify-center text-white transform group-hover:rotate-6 transition-transform duration-300`}>
                <f.icon size={36} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {f.desc}
                </p>
              </div>
            </ClayCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const CoursePreviewSection = () => {
  return (
    <section className="py-24 px-4 bg-white/40 backdrop-blur-3xl border-y border-white/50 relative overflow-hidden">
      {/* bg texture */}
      <div className="absolute inset-0 bg-transparent opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="space-y-8">
          <div className="inline-block px-5 py-2 rounded-xl bg-accent-purple/10 text-accent-purple font-black tracking-wider text-sm mb-2 border border-accent-purple/20">
            KHO TÀI LIỆU KHỔNG LỒ
          </div>
          <h2 className="text-5xl font-black text-slate-800 leading-tight">
            Không học chăm chỉ,<br /> Hãy học <span className="text-primary-600 italic">thông minh</span>.
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Truy cập hàng ngàn bộ đề thi cũ, slide bài giảng và flashcards chất lượng cao do chính các tiền bối và bạn bè chia sẻ. Được kiểm duyệt kỹ lưỡng.
          </p>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="text-3xl font-black text-slate-800">5k+</h4>
              <span className="text-slate-500 font-bold">Đề thi</span>
            </div>
            <div className="w-px bg-slate-300 h-12"></div>
            <div className="flex flex-col gap-2">
              <h4 className="text-3xl font-black text-slate-800">10k+</h4>
              <span className="text-slate-500 font-bold">Flashcards</span>
            </div>
          </div>

          <ProButton variant="secondary" className="px-10 shadow-clay-btn">
            Khám phá ngay
          </ProButton>
        </div>

        <div className="grid gap-6">
          {[
            { tag: "CNTT", title: "Cấu trúc dữ liệu & Giải thuật", members: 120, quiz: 15, accent: "bg-accent-blue" },
            { tag: "Toán", title: "Giải tích 3 - Đa biến", members: 85, quiz: 8, accent: "bg-accent-purple" },
            { tag: "Lý", title: "Vật lý đại cương 1", members: 200, quiz: 24, accent: "bg-accent-orange" },
          ].map((c, idx) => (
            <div key={idx} className={`
                   bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-clay-card-sm border border-white 
                   flex items-center justify-between transform transition-all duration-300 hover:scale-[1.03] cursor-pointer group
                   ${idx === 1 ? 'lg:-translate-x-12' : ''}
                `}>
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl ${c.accent} flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:rotate-12 transition-transform`}>
                  {c.tag}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xl mb-1">{c.title}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-4 font-bold">
                    <span className="flex items-center gap-1.5"><Users size={16} className="text-primary-500" /> {c.members}</span>
                    <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-secondary-500" /> {c.quiz} bộ đề</span>
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all">
                <ChevronRight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const CTASection = () => {
  return (
    <section className="py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-gradient-to-r from-primary-600 to-secondary-600 rounded-[3.5rem] p-16 lg:p-24 text-center overflow-hidden shadow-2xl group cursor-default">

          {/* Dynamic background */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent-yellow/30 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>

          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
              Đừng để thanh xuân <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">vùi dập</span> trong deadline
            </h2>
            <p className="text-white/90 text-2xl font-medium max-w-2xl mx-auto">
              Tham gia cộng đồng học tập lớn nhất HUST ngay hôm nay. Hoàn toàn miễn phí.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <Link to="/register">
                <button className="bg-white text-primary-600 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 hover:shadow-white/20 transition-all flex items-center justify-center gap-3">
                  <Zap fill="currentColor" /> Đăng ký bằng Email HUST
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="bg-white/60 backdrop-blur-xl border-t border-slate-200 pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">

        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3 opacity-90">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Zap size={22} fill="currentColor" />
            </div>
            <span className="font-heading font-black text-2xl text-slate-800">HUSTUDENT</span>
          </div>
          <p className="text-slate-500 font-medium text-center md:text-left">
            Made with ❤️ for students, by students.
          </p>
        </div>

        <div className="flex gap-8">
          {['Facebook', 'Instagram', 'Github', 'Điều khoản', 'Bảo mật'].map(s => (
            <a key={s} href="#" className="text-slate-500 hover:text-primary-600 transition-colors font-bold text-sm tracking-wide">{s}</a>
          ))}
        </div>
      </div>
      <div className="text-center mt-12 text-slate-400 text-sm font-semibold">
        © 2024 HUSTUDENT Platform.
      </div>
    </footer>
  )
}

const LandingPage = () => {
  return (
    <div className="h-screen overflow-y-auto font-body bg-clay-bg bg-gradient-mesh overflow-x-hidden selection:bg-accent-orange selection:text-white">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <CoursePreviewSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
