import avatar from '../assets/Asuka.jpg'

export const PlayerRow = () => {
    return <div className={'flex h-[50px] gap-2 my-3'}>
        <img src={avatar} alt="avatar"/>
        <div className={'text-white'}>Asuka Langley</div>
        <div className={'text-white opacity-[0.6]'}>(800)</div>
    </div>
}