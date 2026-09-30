// Single source for editable content. No registration numbers are stored here.
export const config = {
  instagramUrl: 'https://www.instagram.com/nexus_muj/',
  joinUrl: '', // TODO: add the join/registration form URL when available
  spotifyUrl: 'https://open.spotify.com/album/1dBmFDmTfBtUz1hs9aoRKE',
  mujUrl: 'https://www.jaipur.manipal.edu/dsw-student-clubs.php',
};

export interface Member { name: string; team: string; role: string }
const T = (team: string, heads: string[], jcs: string[] = []): Member[] => [
  ...heads.map(name => ({ name, team, role: 'Team Head' })),
  ...jcs.map(name => ({ name, team, role: 'JC' })),
];
const S = (s: string) => s.split(';').map(x => x.trim());

// Memberships are per-team entries; people are never merged by first name.
// Note: "Devpriy" listed without surname in source roster (pending confirmation). PNR displayed as written in source roster.
export const members: Member[] = [
  { name: 'Aarshee Aarya', team: 'Core Committee', role: 'Head of Operation' },
  { name: 'Sachjyot Kour', team: 'Core Committee', role: 'Creative Head' },
  { name: 'Tejas Narula', team: 'Core Committee', role: 'TechOps Lead' },
  { name: 'Yash Pandey', team: 'Core Committee', role: 'Membership Chair' },
  { name: 'Shaurya Goel', team: 'Core Committee', role: 'Membership Chair' },
  ...T('Events', S('Labya Chandrakar;Aryan Tyagi;Lakshita;Reenika;Dishi'),
    S('Swati Dash;Bhavya Katiyar;Huzaif;Subhod Kumar;Amritansh Singh;Kamakshi Bharti;Punika Pamnani;Sanvee;Rudra Pratap Singh')),
  ...T('Marketing', ['Rashi'], S('Mannat;Ishika;Advaita;Asmi;Daksh Vasudeva;Abhinav Sinha;Nishit Sharma;Aditi')),
  ...T('Finance & Registration · Sponsorship & Curation', S('Preksha Jain;Aditya Sarkar')),
  ...T('Finance & Registration', [], S('Vidit Mittal;Agrim Gupta;Divy;Bhavya;Saksham;Keshav;Dakshesh;Ayush;Shourya;Sahas')),
  ...T('Operations & Logistics', S('Sarvagya Singh;Devpriy')),
  ...T('Logistics', [], S('Kunal Jaiswal;Rithvik Krishna Dusa;Shaurya Thapliyal;Darsh Gupta;Animesh Kushwaha;Pavan Wagh')),
  ...T('Social Media', ['Ridhima Gupta'],
    S('Angad Singh;Soumya;Kritika Sinha;Rachit Agarwal;Rana Chowdary;Bhavya Katiyar;Neelabh Sati;Neev Gupta;Sarthak Rana;Divyanshi Singh;Himanshu Sharma')),
  ...T('Graphic Design', ['Anwesha'], S('Sarthak Srivastava;Ratnajit Dutta')),
  ...T('Web Development', S('Kaustav Paul;Shaaz Adil'),
    S('Vansh Sood;Jatin Pandey;Lakshya Agarwal;Vivan Bhardwaj;Ritvik Bansal;Aditya Goyal;Gunika Madan;Aarav Srivastava;Rashmi Raj;Devika Sharma')),
  ...T('PNR', [], S('Aditya Goyal;G. Shrihari Kshitij;Sahas Reddy Pingili;Karthikeya Kollimarla;Bhavya Gupta;Jyotirmay Sharma;Udita Sau;Nia Kunwar Nirban;Alok Singh;Arsh Rana;Muddam Jaswanth Reddy;Saatvik Shyam Chakravarthi')),
];


// Editable sections. Leave an array empty to show its empty state; add entries only once verified.
export interface Project { title: string; text: string; status: string; date?: string; url?: string }
export interface EventItem { title: string; date: string; venue: string; status: string; url?: string }
export const projects: Project[] = []; // TODO: add verified Nexus projects
export const events: EventItem[] = []; // TODO: add verified events with registration links
