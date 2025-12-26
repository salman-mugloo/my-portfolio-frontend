import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { projectsAPI, expertiseAPI, skillsAPI, certificationsAPI, contactAPI, profileAPI, resumeAPI, featuresAPI, contactInfoAPI, educationAPI } from './services/api';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring,
  useInView
} from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Users, 
  Database, 
  Server, 
  Layout, 
  BarChart3, 
  FileText, 
  Lock, 
  Terminal, 
  ArrowRight, 
  Github, 
  CheckCircle2, 
  ClipboardCheck,
  Smartphone,
  PieChart,
  GitBranch,
  Layers,
  HeartPulse,
  Sparkles,
  ChevronDown,
  Mail,
  Globe,
  Code,
  Briefcase,
  Award,
  BookOpen,
  Linkedin,
  ExternalLink,
  X,
  Brain,
  CheckCircle,
  AlertCircle,
  Send,
  Image,
  GraduationCap
} from 'lucide-react';

// --- Shared Spring Config ---
const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

// --- UI Components ---

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="mb-16 space-y-4">
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 text-emerald-400 font-mono text-xs tracking-[0.3em] uppercase"
    >
      <div className="w-12 h-px bg-emerald-500/50" />
      {Icon && <Icon size={14} />}
      <span>{subtitle}</span>
    </motion.div>
    <h2 className="text-4xl md:text-6xl font-black tracking-tight">{title}</h2>
  </div>
);

const Navbar = ({ resumeUrl }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-xl bg-black/60 border-b border-white/5 py-3' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Code className="text-black" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter">Salman Mugloo</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {['Home', 'About', 'Skills', 'Projects', 'Certifications', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-emerald-400 transition-colors">{item}</a>
          ))}
        </div>

        <button 
          onClick={() => {
            if (resumeUrl) {
              window.open(resumeUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          disabled={!resumeUrl}
          className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Resume
        </button>
      </div>
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const data = await profileAPI.getProfile();
        // Format profile image URL if exists (same normalization as certificate images)
        if (data && data.profileImageUrl) {
          let imageUrl;
          if (data.profileImageUrl.startsWith('http')) {
            imageUrl = data.profileImageUrl;
          } else {
            // Normalize path to always start with '/' (same logic as certificates)
            let normalizedPath = data.profileImageUrl;
            
            // Remove 'server/' prefix if present (e.g., "server/uploads/..." -> "uploads/...")
            if (normalizedPath.startsWith('server/')) {
              normalizedPath = normalizedPath.substring(7);
            }
            
            // Ensure path starts with '/'
            if (!normalizedPath.startsWith('/')) {
              normalizedPath = '/' + normalizedPath;
            }
            
            // Build absolute URL using API_URL (same as certificate images/PDFs)
            imageUrl = `${API_URL.replace('/api', '')}${normalizedPath}`;
          }
          console.log('Portfolio: Profile image URL constructed:', imageUrl);
          data.profileImageUrl = imageUrl;
        }
        if (data) {
          setProfile(data);
        } else {
          throw new Error('No profile data received');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Use defaults if API fails
        setProfile({
          name: 'Salman Mugloo',
          title: 'Software Developer & AI/ML Enthusiast',
          tagline: 'Building innovative solutions with programming and Machine Learning.',
          profileImageUrl: null
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-6">
        <div className="text-center text-gray-500">Loading...</div>
      </section>
    );
  }

  const nameParts = profile?.name?.split(' ') || ['SALMAN', 'MUGLOO'];
  const firstName = nameParts[0]?.toUpperCase() || 'SALMAN';
  const lastName = nameParts.slice(1).join(' ').toUpperCase() || 'MUGLOO';

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div style={{ y, opacity }} className="text-center lg:text-left">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md mb-8"
        >
          <Activity className="text-emerald-400" size={16} />
          <span className="text-[10px] font-black tracking-[0.2em] text-emerald-400 uppercase">Available for Opportunities</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-[8rem] font-black leading-[0.9] tracking-tighter mb-8"
        >
              {firstName}<br />
              <span className="bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-900 bg-clip-text text-transparent">{lastName}</span>
        </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-medium leading-relaxed"
            >
              {profile?.title || 'Software Developer & AI/ML Enthusiast'}. 
              {profile?.tagline ? ` ${profile.tagline}` : ' Building innovative solutions with programming and Machine Learning.'}
            </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
        >
          <a href="#projects" className="px-10 py-5 bg-white text-black font-black text-sm rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all active:scale-95 group shadow-2xl shadow-emerald-500/10">
            VIEW WORK <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </a>
          <a href="#contact" className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-sm rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all active:scale-95">
            CONTACT ME
          </a>
        </motion.div>
      </motion.div>

          {/* Right: Profile Image */}
          {profile?.profileImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <img
                  src={profile.profileImageUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover grayscale transition-all duration-400 ease-in-out hover:grayscale-0 hover:scale-[1.02]"
                  style={{
                    filter: 'grayscale(100%)',
                    transition: 'filter 0.4s ease, transform 0.4s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.filter = 'grayscale(0%)';
                    e.target.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.filter = 'grayscale(100%)';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30"
      >
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
};

const FeatureCard = ({ title, desc, icon: Icon, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
        <Icon size={120} />
      </div>
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      <h3 className="text-2xl font-black mb-4 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
};

const SkillsInteractive = () => {
  const [activeSkill, setActiveSkill] = useState(0);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const data = await expertiseAPI.getExpertise();
        // Map icon strings to actual icon components
        const iconMap = { Code, Layout, Brain, Terminal, Server, Database };
        const mappedData = data.map(item => ({
          ...item,
          icon: iconMap[item.icon] || Code
        }));
        setSkills(mappedData);
      } catch (error) {
        console.error('Error fetching expertise:', error);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExpertise();
  }, []);

  if (loading || skills.length === 0) {
    return (
      <section id="skills" className="py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="TECHNICAL EXPERTISE" subtitle="Skills & Technologies" icon={Code} />
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  const ActiveIcon = skills[activeSkill]?.icon || Code;

  return (
    <section id="skills" className="py-32 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="TECHNICAL EXPERTISE" subtitle="Skills & Technologies" icon={Code} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            {skills.map((skill, idx) => {
              const Icon = skill.icon;
              return (
                <motion.button
                  key={idx}
                  onClick={() => setActiveSkill(idx)}
                  className={`w-full text-left p-6 rounded-3xl transition-all border ${
                    activeSkill === idx 
                      ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_10px_40px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${activeSkill === idx ? 'text-black' : 'text-emerald-400'}`}>
                      <Icon size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight">{skill.title}</h4>
                      <p className={`text-xs ${activeSkill === idx ? 'text-black/70' : 'text-gray-500'}`}>Click to view details</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkill}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-12 rounded-[3rem] bg-white/5 border border-white/5 relative overflow-hidden"
              >
                <div className="absolute -bottom-10 -right-10 text-white/[0.02]">
                  <ActiveIcon size={200} />
                </div>
                <h3 className="text-4xl font-black mb-6 text-emerald-400">Technologies</h3>
                <p className="text-xl text-gray-300 mb-10 leading-relaxed italic">"{skills[activeSkill].desc}"</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {skills[activeSkill].capabilities.map(cap => (
                    <div key={cap} className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      <span className="font-bold tracking-wide">{cap}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsAPI.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Fallback to empty array on error
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Icon mapping helper
  const getIcon = (iconName) => {
    const iconMap = { Code, Layout, Brain, Terminal, Server, Database };
    return iconMap[iconName] || Code;
  };

  if (loading) {
    return (
      <section id="projects" className="py-32 px-6 bg-[#030303] relative">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="MY PROJECTS" subtitle="Portfolio" icon={Briefcase} />
          <div className="text-center text-gray-500">Loading projects...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-32 px-6 bg-[#030303] relative">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="MY PROJECTS" subtitle="Portfolio" icon={Briefcase} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{project.title}</h3>
                {project.github && (
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-500 hover:text-emerald-400 transition-colors"
                  >
                    <Github size={20} />
                  </a>
                )}
              </div>
              <p className="text-gray-500 leading-relaxed font-medium mb-6">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t, i) => (
                  <span key={i} className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TechStackSection = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await skillsAPI.getSkills();
        // Map icon strings to actual icon components
        const iconMap = { Code, Terminal, Layout, Brain, Server, Database };
        const mappedData = data.map(item => ({
          title: item.title,
          desc: item.desc,
          icon: iconMap[item.icon] || Code,
          color: item.color || "from-emerald-500"
        }));
        setSkills(mappedData);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) {
    return (
      <section id="skills" className="py-32 px-6 bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="TECH STACK" subtitle="Technologies" icon={Layers} />
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="py-32 px-6 bg-[#030303]">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="TECH STACK" subtitle="Technologies" icon={Layers} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((tech, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-1 w-full rounded-3xl bg-white/5 border border-white/10 group overflow-hidden"
            >
              <div className={`p-8 rounded-[1.4rem] bg-black h-full group-hover:bg-white/[0.02] transition-all`}>
                <div className="mb-6 flex justify-between items-start">
                  <tech.icon className="text-emerald-400" size={32} />
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${tech.color} opacity-20 group-hover:opacity-100 transition-opacity blur-md`} />
                </div>
                <h4 className="text-xl font-black mb-3">{tech.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{tech.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ title, desc, tech, link, github, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-2xl font-black group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{title}</h3>
        <div className="flex gap-3">
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-400 transition-colors">
              <Github size={20} />
            </a>
          )}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-400 transition-colors">
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>
      <p className="text-gray-500 leading-relaxed font-medium mb-6">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {tech.map((t, i) => (
          <span key={i} className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const CertificationsSection = () => {
  const [selectedCert, setSelectedCert] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const data = await certificationsAPI.getCertifications();
        // Map API data to match frontend structure
        const formatted = data.map((cert) => ({
          id: cert.id,
          title: cert.title,
          issuer: cert.issuer,
          image: cert.image ? `${API_URL.replace('/api', '')}${cert.image}` : null,
          pdf: cert.pdf ? `${API_URL.replace('/api', '')}${cert.pdf}` : null
        }));
        setCertificates(formatted);
      } catch (error) {
        console.error('Error fetching certifications:', error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCertifications();
  }, []);

  const handleCertClick = (cert) => {
    setSelectedCert(cert);
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    setSelectedCert(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (selectedCert) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [selectedCert]);

  if (loading) {
    return (
      <section id="certifications" className="py-32 px-6 bg-[#030303] relative">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="CERTIFICATIONS" subtitle="Achievements" icon={Award} />
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="certifications" className="py-32 px-6 bg-[#030303] relative">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="CERTIFICATIONS" subtitle="Achievements" icon={Award} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCertClick(cert)}
            >
              <motion.div
                className="relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 p-6"
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: -5,
                  z: 50
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="w-full h-48 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                    {cert.image ? (
                      <img 
                        src={cert.image} 
                        alt={cert.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (cert.pdf) {
                            const pdfFrame = e.target.parentElement.querySelector('.pdf-preview');
                            if (pdfFrame) pdfFrame.style.display = 'block';
                          } else {
                            const nextSibling = e.target.nextSibling;
                            if (nextSibling && nextSibling.style) {
                              nextSibling.style.display = 'flex';
                            }
                          }
                        }}
                      />
                    ) : cert.pdf ? (
                      <iframe
                        src={`${encodeURI(cert.pdf)}#page=1&zoom=50`}
                        className="w-full h-full pdf-preview border-0"
                        title={cert.title}
                        style={{ pointerEvents: 'none' }}
                        loading="lazy"
                      />
                    ) : null}
                    {!cert.image && !cert.pdf && (
                      <div className="w-full h-full items-center justify-center bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex">
                      <Award className="text-emerald-400" size={64} />
                    </div>
                    )}
                  </div>
                  <h3 className="text-xl font-black mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">{cert.issuer}</p>
                </div>

                <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="text-emerald-400" size={16} />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-lg flex items-center justify-center p-6"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-black/50 border border-white/10 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-30 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all group"
              >
                <X className="text-white group-hover:rotate-90 transition-transform" size={24} />
              </button>

              {/* Certificate Content */}
              <div className="relative p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-2xl font-black text-emerald-400 mb-2">{selectedCert.title}</h3>
                  <p className="text-gray-400">Issued by {selectedCert.issuer}</p>
                </div>

                <div className="relative w-full bg-white/5 rounded-xl overflow-hidden">
                  {selectedCert.image ? (
                    <img 
                      src={selectedCert.image} 
                      alt={selectedCert.title}
                      className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (selectedCert.pdf) {
                          const pdfFrame = e.target.parentElement.querySelector('.pdf-preview-modal');
                          if (pdfFrame) pdfFrame.style.display = 'block';
                        }
                      }}
                    />
                  ) : selectedCert.pdf ? (
                    <iframe
                      src={`${encodeURI(selectedCert.pdf)}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-[60vh] pdf-preview-modal border-0"
                      title={selectedCert.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-[60vh] flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-blue-500/10">
                      <Award className="text-emerald-400" size={128} />
                    </div>
                  )}
                </div>

                {/* PDF Download Button */}
                {selectedCert.pdf && (
                  <div className="mt-6 space-y-4">
                    {/* PDF Preview */}
                    <div className="w-full bg-white/5 rounded-xl overflow-hidden border border-white/10" style={{ minHeight: '400px' }}>
                      <iframe
                        src={`${encodeURI(selectedCert.pdf)}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        style={{ minHeight: '400px' }}
                        title={selectedCert.title}
                        loading="lazy"
                      />
                    </div>
                    {/* View PDF Button */}
                    <a
                      href={encodeURI(selectedCert.pdf)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-6 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText size={20} />
                      View Full PDF
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// About Section Component
const AboutSection = () => {
  const [profile, setProfile] = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon mapping
  const iconMap = {
    'Code': Code,
    'ShieldCheck': ShieldCheck,
    'Activity': Activity,
    'Users': Users
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, featuresData] = await Promise.all([
          profileAPI.getProfile(),
          featuresAPI.getFeatures()
        ]);
        setProfile(profileData);
        setFeatures(featuresData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use defaults if API fails
        setProfile({
          aboutText: "I'm a passionate software developer with a strong foundation in computer science and a love for creating innovative digital solutions. Currently pursuing my BCA degree, I combine academic knowledge with hands-on experience in programming and machine learning.\n\nMy journey in software development has equipped me with expertise in programming languages like Java and Python, web technologies, and machine learning. I thrive on solving complex problems and turning ideas into reality through code, especially in AI and data analysis.",
          yearsExperience: 0,
          projectsCount: 50,
          dedicationPercent: 100
        });
        // Default features if API fails
        setFeatures([
          { icon: 'Code', label: "Clean Code", tooltip: "Readable, maintainable, scalable codebases" },
          { icon: 'ShieldCheck', label: "Security First", tooltip: "Role-based access and secure data handling" },
          { icon: 'Activity', label: "Performance", tooltip: "Optimized frontend and backend systems" },
          { icon: 'Users', label: "User Focused", tooltip: "Design driven by usability and clarity" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
  return (
      <section id="about" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="ABOUT ME" subtitle="Introduction" icon={Briefcase} />
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  const aboutParagraphs = profile?.aboutText?.split('\n\n') || [];

  return (
      <section id="about" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="ABOUT ME" subtitle="Introduction" icon={Briefcase} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
            {aboutParagraphs.map((paragraph, index) => (
              <p 
                key={index}
                className={`${index === 0 ? 'text-xl text-gray-300' : 'text-lg text-gray-400'} leading-relaxed`}
              >
                {paragraph}
              </p>
            ))}
              <div className="flex gap-8 pt-4">
                <div className="space-y-1">
                <div className="text-3xl font-black text-emerald-500">{profile?.yearsExperience || 0}+</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Years Experience</div>
                </div>
                <div className="space-y-1">
                <div className="text-3xl font-black text-emerald-500">{profile?.projectsCount || 50}+</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Projects Built</div>
                </div>
                <div className="space-y-1">
                <div className="text-3xl font-black text-emerald-500">{profile?.dedicationPercent || 100}%</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dedicated</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {features.map((item, i) => {
                const IconComponent = iconMap[item.icon] || Code;
                return (
                <div key={i} className="relative group">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all"
                  >
                      <IconComponent className="text-emerald-400" size={32} />
                    <span className="text-sm font-bold text-gray-300">{item.label}</span>
                  </motion.div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-black/90 backdrop-blur-md rounded-lg border border-emerald-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none z-10 hidden md:block">
                    {item.tooltip}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
  );
};

// Contact Form Modal Component
const ContactFormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form when closing
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      setSubmitStatus(null);
      setSubmitMessage('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 5000) {
      newErrors.message = 'Message must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await contactAPI.sendMessage(formData);
      setSubmitStatus('success');
      setSubmitMessage(response.message || 'Message sent successfully! I\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      
      // Auto-close after 3 seconds on success
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
              <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-lg flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-2xl w-full max-h-[90vh] bg-black/50 border border-white/10 rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all group"
          >
            <X className="text-white group-hover:rotate-90 transition-transform" size={24} />
          </button>

          {/* Form Content */}
          <div className="relative p-8 overflow-y-auto max-h-[90vh]">
            <div className="mb-6">
              <h3 className="text-3xl font-black text-emerald-400 mb-2">Let's Connect</h3>
              <p className="text-gray-400">Send me a message and I'll get back to you soon!</p>
                  </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} />
                <p className="text-emerald-400 font-medium">{submitMessage}</p>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
                <p className="text-red-400 font-medium">{submitMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                  placeholder="Your name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400">{errors.name}</p>
                )}
          </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                )}
        </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.message
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                  placeholder="Tell me about your project or just say hello..."
                  disabled={isSubmitting}
                />
                <div className="mt-2 flex justify-between items-center">
                  {errors.message && (
                    <p className="text-sm text-red-400">{errors.message}</p>
                  )}
                  <p className={`text-xs ml-auto ${formData.message.length > 5000 ? 'text-red-400' : 'text-gray-500'}`}>
                    {formData.message.length} / 5000
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className="flex-1 px-6 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Education Section Component
const EducationSection = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const data = await educationAPI.getEducation();
        setEducation(data || []);
      } catch (error) {
        console.error('Error fetching education:', error);
        setEducation([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEducation();
  }, []);

  if (loading) {
  return (
      <section id="education" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="EDUCATION" subtitle="Journey" icon={GraduationCap} />
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  if (education.length === 0) {
    return null;
  }

  return (
    <section id="education" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="EDUCATION" subtitle="Journey" icon={GraduationCap} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {education.map((item, index) => (
      <motion.div 
              key={item._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="text-emerald-400" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-1">{item.degree}</h3>
                  <p className="text-sm text-gray-400 mb-2">{item.field}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{item.institution}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <span>{item.startYear}</span>
                <span>—</span>
                <span className="font-bold text-emerald-400">{item.endYear || 'Present'}</span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section Component
const ContactSection = ({ onOpenModal }) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Icon mapping for contact types
  const contactIconMap = {
    github: Github,
    linkedin: Linkedin,
    leetcode: Code,
    instagram: Image,
    codeforces: Code
  };

  // Contact type labels
  const contactLabels = {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    leetcode: 'LeetCode',
    instagram: 'Instagram',
    codeforces: 'Codeforces'
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await contactInfoAPI.getContactInfo();
        setContactInfo(data);
      } catch (error) {
        console.error('Error fetching contact info:', error);
        // Use defaults if API fails
        setContactInfo({
          description: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.",
          email: "mugloosalman@gmail.com",
          contacts: [
            { type: 'github', url: 'https://github.com/salman-mugloo/' },
            { type: 'linkedin', url: 'https://www.linkedin.com/in/salman-mugloo-/' }
          ],
          connectTitle: "Let's Connect",
          connectDescription: "Whether you have a question or just want to say hi, I'll try my best to get back to you!"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  if (loading || !contactInfo) {
    return (
      <section id="contact" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="GET IN TOUCH" subtitle="Contact" icon={Mail} />
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  // Get contacts array (support both old and new structure)
  const contacts = contactInfo.contacts || [];
  // Migrate old structure if needed
  const migratedContacts = [...contacts];
  if (contactInfo.githubUrl && !migratedContacts.find(c => c.type === 'github')) {
    migratedContacts.push({ type: 'github', url: contactInfo.githubUrl });
  }
  if (contactInfo.linkedinUrl && !migratedContacts.find(c => c.type === 'linkedin')) {
    migratedContacts.push({ type: 'linkedin', url: contactInfo.linkedinUrl });
  }

  return (
      <section id="contact" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="GET IN TOUCH" subtitle="Contact" icon={Mail} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <p className="text-xl text-gray-300 leading-relaxed">
              {contactInfo.description}
              </p>
              <div className="space-y-6">
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</div>
                  <div className="text-lg font-bold text-white">{contactInfo.email}</div>
                  </div>
                </a>
                
              {migratedContacts.length > 0 && (
                <div className="flex gap-4 flex-wrap">
                  {migratedContacts.map((contact, index) => {
                    const IconComponent = contactIconMap[contact.type] || Code;
                    return (
                      <a
                        key={index}
                        href={contact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                        title={contactLabels[contact.type] || contact.type}
                      >
                        <IconComponent className="text-emerald-400 group-hover:scale-110 transition-transform" size={20} />
                      </a>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="p-12 rounded-[3rem] bg-white/5 border border-white/5 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 text-white/[0.02]">
                <Mail size={200} />
              </div>
            <h3 className="text-3xl font-black mb-6 text-emerald-400">{contactInfo.connectTitle}</h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
              {contactInfo.connectDescription}
              </p>
              <button 
              onClick={onOpenModal}
                className="px-8 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-3 group"
              >
                SEND MESSAGE <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

// --- Portfolio App Component ---

export function PortfolioApp() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, springConfig);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Fetch resume URL from Resume API
  useEffect(() => {
    const fetchResumeUrl = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const data = await resumeAPI.getResume();
        if (data && data.fileUrl) {
          const url = data.fileUrl.startsWith('http')
            ? data.fileUrl
            : `${API_URL.replace('/api', '')}${data.fileUrl}`;
          setResumeUrl(url);
        } else {
          setResumeUrl(null);
        }
      } catch (error) {
        console.error('Error fetching resume URL:', error);
        setResumeUrl(null);
      }
    };
    fetchResumeUrl();
  }, []);

  return (
    <div className="bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-400 min-h-screen font-sans antialiased overflow-x-hidden">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-[100] origin-left shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        style={{ scaleX }}
      />
      
      <Navbar resumeUrl={resumeUrl} />
      <Hero />

      {/* About Section */}
      <AboutSection />

      {/* Education Section */}
      <EducationSection />

      {/* Core Tech Stack */}
      <TechStackSection />

      <SkillsInteractive />

      <ProjectsSection />

      <CertificationsSection />

      {/* Contact Section */}
      <ContactSection onOpenModal={() => setIsContactModalOpen(true)} />

      {/* Global Footer */}
      <footer className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Code className="text-black" size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">Portfolio</span>
            </div>
            <p className="text-gray-500 max-w-sm">
              Building innovative solutions with modern technologies and creative problem-solving.
            </p>
            <div className="flex justify-center md:justify-start gap-6">
              <a href="https://github.com/salman-mugloo/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-emerald-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/salman-mugloo-/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-emerald-400 transition-colors">
                <Linkedin size={20} />
              </a>
              
            </div>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-white">Navigation</h5>
            <div className="flex flex-col gap-4 text-sm text-gray-500">
              <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
              <a href="#skills" className="hover:text-emerald-400 transition-colors">Skills</a>
              <a href="#projects" className="hover:text-emerald-400 transition-colors">Projects</a>
              <a href="#certifications" className="hover:text-emerald-400 transition-colors">Certifications</a>
              <a href="#contact" className="hover:text-emerald-400 transition-colors">Contact</a>
            </div>
          </div>

        </div>
        
        <div className="mt-20 pt-12 border-t border-white/5 text-center px-6">
          <p className="text-gray-700 text-[10px] font-bold tracking-[0.5em] uppercase">
            Created by Mr. Salman Mugloo
          </p>
        </div>
      </footer>

      {/* Contact Form Modal */}
      <ContactFormModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      {/* Custom Cursor Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]" />
      </div>
    </div>
  );
}
