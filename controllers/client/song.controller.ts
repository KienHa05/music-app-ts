import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Singer from "../../models/singer.model";
import FavouriteSong from "../../models/favourite-song.model";

// [GET] /songs/:slugTopic
export const list = async (req: Request, res: Response) => {
    const topic = await Topic.findOne({
        slug: req.params.slugTopic,
        status: "active",
        deleted: false
    });

    const songs = await Song.find({
        topicId: topic.id,
        status: "active",
        deleted: false
    }).select("avatar title slug singerId like");

    for (const song of songs) {
        const infoSinger = await Singer.findOne({
            _id: song.singerId,
            status: "active",
            deleted: false
        });

        song["infoSinger"] = infoSinger;
    }

    res.render("client/pages/songs/list", {
        pageTitle: topic.title,
        songs: songs
    });
};

// [GET] /songs/detail/:slugSong
export const detail = async (req: Request, res: Response) => {
    const slugSong: string = req.params.slugSong;

    const song = await Song.findOne({
        slug: slugSong,
        status: "active",
        deleted: false,
    });

    const singer = await Singer.findOne({
        _id: song.singerId,
        deleted: false
    }).select("fullName");

    const topic = await Topic.findOne({
        _id: song.topicId,
        deleted: false
    }).select("title");

    const favouriteSong = await FavouriteSong.findOne({
        // userId: "", // Phần đăng nhập (tự code)
        songId: song.id
    });

    song["isFavouriteSong"] = favouriteSong ? true : false;

    res.render("client/pages/songs/detail", {
        pageTitle: "Chi Tiết Bài Hát",
        song: song,
        singer: singer,
        topic: topic
    });
};

// [PATCH] /songs/like/:typeLike/:idSong
export const like = async (req: Request, res: Response) => {
    const idSong: string = req.params.idSong;
    const typeLike: string = req.params.typeLike;

    const song = await Song.findOne({
        _id: idSong,
        status: "active",
        deleted: false
    });

    const newLike: number = typeLike == "like" ? song.like + 1 : song.like - 1;

    await Song.updateOne(
        {
            _id: idSong,
        },
        {
            like: newLike
        },
    );
    // like: ["id_user_1","id_user_2"]

    res.json({
        code: 200,
        message: "Thành Công!",
        like: newLike
    });
};

// [PATCH] /songs/favourite/:typeFavourite/:idSong
export const favourite = async (req: Request, res: Response) => {
    const idSong: string = req.params.idSong;
    const typeFavourite: string = req.params.typeFavourite;

    switch (typeFavourite) {
        case "favourite":
            const existFavouriteSong = await FavouriteSong.findOne({
                songId: idSong
            });
            if (!existFavouriteSong) {
                const record = new FavouriteSong({
                    // userId: "", // Phần đăng nhập (tự code)
                    songId: idSong,
                });
                await record.save();
            }
            break;
        case "unfavourite":
            await FavouriteSong.deleteOne({
                songId: idSong
            });
            break;
        default:
            break;
    }

    res.json({
        code: 200,
        message: "Thành Công!",
    });
};

// [PATCH] /songs/like/:typeLike/:idSong
export const listen = async (req: Request, res: Response) => {
    const idSong: string = req.params.idSong;

    const song = await Song.findOne({
        _id: idSong,
    });

    const listen: number = song.listen + 1;

    await Song.updateOne(
        {
            _id: idSong,
        },
        {
            listen: listen
        },
    );

    const songNew = await Song.findOne({
        _id: idSong
    });

    res.json({
        code: 200,
        message: "Thành Công!",
        listen: songNew.listen
    });
};