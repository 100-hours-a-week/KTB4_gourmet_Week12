package GourmetCommunity.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long id;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "is_thumbnail", nullable = false)
    private boolean thumbnail = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "post_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_post_images_post")
    )
    private Post post;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public PostImage(Post post, String imageUrl) {
        this.post = post;
        this.imageUrl = imageUrl;
        this.sortOrder = 0;
        this.thumbnail = false;
    }

    public PostImage(Post post, String imageUrl, int sortOrder, boolean thumbnail) {
        this.post = post;
        this.imageUrl = imageUrl;
        this.sortOrder = sortOrder;
        this.thumbnail = thumbnail;
    }

    public void update(String imageUrl, int sortOrder, boolean thumbnail) {
        this.imageUrl = imageUrl;
        this.sortOrder = sortOrder;
        this.thumbnail = thumbnail;
    }

    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}