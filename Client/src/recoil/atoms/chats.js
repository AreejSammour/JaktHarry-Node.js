import { atom } from "recoil";
import { recoilPersist } from 'recoil-persist'

const { persistAtom } = recoilPersist()

export const chatsState = atom({
    key: 'chats',
    default: [],
    effects_UNSTABLE: [
        persistAtom,
    ],

})