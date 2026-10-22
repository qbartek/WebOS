export default function Desktop() {
  return (
    <>
      <div className='desktop'>
        <button className='desktop-icon' onClick={() => pm.start('notepad')}>Notepad</button>
      </div>
    </>
  )
}
