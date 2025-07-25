package com.eashan.shazam_api.model;

public class Song {
    private int id;
    private String title;
    private String artist;
    private String album;
    private String coverPath;  // Local path to the image
    private String coverUrl;   // Optional: URL to access from frontend
    private int fingerprintHash;
    private int timestamp;
    private String songUrl;

    public Song() {}

    public Song(String title, String artist, String coverPath) {
        this.title = title;
        this.artist = artist;
        this.coverPath = coverPath;
    }

    // Getters and Setters
    public String getSongUrl() {
        return songUrl;
    }

    public void setSongUrl(String songUrl) {
        this.songUrl = songUrl;
    }
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }

    public String getAlbum() { return album; }
    public void setAlbum(String album) { this.album = album; }

    public String getCoverPath() { return coverPath; }
    public void setCoverPath(String coverPath) { this.coverPath = coverPath; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    public int getFingerprintHash() { return fingerprintHash; }
    public void setFingerprintHash(int fingerprintHash) { this.fingerprintHash = fingerprintHash; }

    public int getTimestamp() { return timestamp; }
    public void setTimestamp(int timestamp) { this.timestamp = timestamp; }
}
