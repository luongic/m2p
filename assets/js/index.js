const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('.progress') 
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const title = $('title')
const icon = $(`link[rel~='icon']`)
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const wish = $('header h4')



const app = {
    currentIndex : 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songs: [
        {
            name: 'There\'s no one at all',
            singer: 'Sơn Tùng M-TP',
            url: './assets/song/no1atall.mp3',
            image: './assets/img/no1atall.jpg'
        },
        {
            name: 'good 4 u',
            singer: 'Olivia Rodrigo',
            url: './assets/song/good4u.mp3',
            image: './assets/img/good4u.jpg'
        },
        {
            name: 'Driver\'s License',
            singer: 'Olivia Rodrigo',
            url: './assets/song/driver.mp3',
            image: './assets/img/driver.jpg'
        },
        {
            name: 'traitor',
            singer: 'Olivia Rodrigo',
            url: './assets/song/traitor.mp3',
            image: './assets/img/traitor.jpg'
        },
        {
            name: 'happier',
            singer: 'Olivia Rodrigo',
            url: './assets/song/happier.mp3',
            image: './assets/img/happier.jpg'
        },

        {
            name: 'Closer',
            singer: 'The Chainsmokers',
            url: './assets/song/closer.mp3',
            image: './assets/img/closer.jpg'
        },
        {
            name: 'Hate me',
            singer: 'Ellie Goulding, Juice WRLD',
            url: './assets/song/hateme.mp3',
            image: './assets/img/hateme.jpg'
        },
        {
            name: 'Circles',
            singer: 'Post Malone',
            url: './assets/song/circles.mp3',
            image: './assets/img/circles.jpg'
        },
        {
            name: 'Sunflower',
            singer: 'Post Malone',
            url: './assets/song/sunflower.mp3',
            image: './assets/img/sunflower.jpg'
        },
        {
            name: 'Sorry',
            singer: 'Halsey',
            url: './assets/song/sorry.mp3',
            image: './assets/img/sorry.jpg'
        },
        {
            name: 'With out me',
            singer: 'Halsey',
            url: './assets/song/withoutme.mp3',
            image: './assets/img/withoutme.jpg'
        },
    ],
    render: function(){
        const htmls = this.songs.map((song , index)=>{
            return `
            <div class="song" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    ♪
                </div>
                <div class="option2">
                    <div class="ball"></div>
                    <div class="ball"></div>
                    <div class="ball"></div>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth

        // Animate CD spin
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 4000,
            iterations: Infinity
        })

        cdThumbAnimate.pause()

        // Scroll => resize CD 
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Pause & Play
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()

        }

        audio.ontimeupdate = function(){
            if( audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        playBtn.onclick = function(){
            if (_this.isPlaying){
                audio.pause()
            }
            else{
                audio.play()
            }
        }

        nextBtn.onclick = function(){
            if (_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.nextSong()
            }
            audio.play()
        }

        prevBtn.onclick = function(){
            if (_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.prevSong()
            }
            audio.play()
        }

        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        repeatBtn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        audio.onended = function(){
            if (_this.isRepeat){
                audio.play()
            } else{
                nextBtn.click()
            }
        }

        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')

            if ( songNode || e.target.closet('.option')){
                
                if (songNode){
                    _this.currentIndex = songNode.dataset.index
                    _this.loadCurrentSong()
                    audio.play()
                }

            }
        }
    },

    givenWishes: function(){
        const d = new Date()
        const Hour = d.getHours()
        console.log(Hour)

        if (Hour > 1 && Hour <= 11){
            wish.textContent = 'Wake your day up with: '
        }
        else if(Hour >= 12 && Hour <= 17){
            wish.textContent = `Take a little break with ${this.currentSong.singer} and the song: `

        }else{
            wish.textContent = 'Everything will be fine, now take a rest with:'

        }
    },

    loadCurrentSong: function(){
        heading.textContent = `♪ ${this.currentSong.name} ♪`
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.url
        title.textContent = `♪ ${this.currentSong.name} ♪`
        icon.href = `${this.currentSong.image}`
        this.activeCurrentSong()


        // check time && display
        this.givenWishes()
    },
    nextSong: function(){
        this.currentIndex++
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    activeCurrentSong: function(){
        const songs = $$('.song');
        songs.forEach((song) => {
            song.classList.remove("active");
        });
        songs[this.currentIndex].classList.add("active");
    },

    start: function() {
        this.defineProperties()
        this.handleEvents()

        
        this.render()
        this.activeCurrentSong()
        this.loadCurrentSong()
    }

}

app.start()