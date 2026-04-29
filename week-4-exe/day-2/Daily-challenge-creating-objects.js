class Video {
  constructor(title, uploader, time) {
    this.title = title;
    this.uploader = uploader;
    this.time = time;
  }

  watch() {
    console.log(`${this.uploader} watched all ${this.time} seconds of "${this.title}"!`);
  }
}

const video1 = new Video("JavaScript Basics", "Elvis", 300);
video1.watch();

const video2 = new Video("React Crash Course", "Brian", 600);
video2.watch();

const videoData = [
  { title: "JS Fundamentals", uploader: "Alice", time: 200 },
  { title: "CSS Animations", uploader: "Bob", time: 150 },
  { title: "HTML Deep Dive", uploader: "Charlie", time: 400 },
  { title: "Node.js Intro", uploader: "Dave", time: 350 },
  { title: "MongoDB Guide", uploader: "Eve", time: 500 }
];

const videos = [];

videoData.forEach(data => {
  const video = new Video(data.title, data.uploader, data.time);
  videos.push(video);
});

// Call watch() for each video
videos.forEach(video => video.watch());