import About from "./About";
import Footer from "./Footer";
import NewPost from "./NewPost";
import Header from "./Header";
import Nav from "./Nav";
import Home from "./Home";
import PostPage from "./PostPage";
import EditPos from "./EditPost";
import Post from "./Post";
import Missing from "./Missing";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import PostLayout from "./PostLayout";
import { useEffect, useState } from "react";
import {format, set} from "date-fns";
import { BrowserRouter } from "react-router-dom";
import api from "./api/posts"
import PostEdit from "./EditPost";
import EditPost from "./EditPost";
import useWindowsize from "./hooks/useWindowSize";


function App() {

  const [posts,setPosts] = useState([])

  const [search,setSearch] = useState('')
  const [searchResults,setSearchResults] = useState([])
  const [postTile, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')  
  const navigate = useNavigate()
  const {width} = useWindowsize

  useEffect(()=>{
      const fetchposts = async() =>{
        try{
          const response = await api.get('/posts')
          setPosts(response.data)
        }
        catch(err){
          if(err.response){
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
          }
          else{
            console.log(`Error:${err.message}`)
          }
        }
      }
      fetchposts();
  },[])

  useEffect(()=>{
    const filteredResults = posts.filter((post)=>((post.body).toLowerCase()).includes(search.toLowerCase())||((post.title).toLowerCase()).includes(search.toLowerCase()))
    setSearchResults(filteredResults.reverse())
  },[posts,search])

  const handleSubmit = async(e) =>{
    e.preventDefault();
    try{
    const id = posts.length ? posts[posts.length -1].id + 1 : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = {id, title: postTile, datetime, body: postBody};
    const response = await api.post('/posts',newPost)
    const allPosts = [...posts, response.data];
    setPosts(allPosts);
    setPostTitle('');
    setPostBody('');
    }catch(err){if(err.response){
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
    }
    else{
      console.log(`Error:${err.message}`)
    }
  }
    
    // navigate('/');
  }
  const handleEdit = async(id) =>{
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost = {id, title: editTitle, datetime, body: editBody};
    try{
      const response = await api.put(`/posts/${id}`,updatedPost)
      setPosts(posts.map(post => post.id===id? {... response.data}:post));
      setEditTitle('');
      setEditBody('');
 
    }catch(err){
      console.log(`Error:${err.message}`)
    }
  }

  const handleDelete = async(id) =>{
    try{
    await api.delete(`/posts/${id}`)
    const postsList = posts.filter(post=> post.id !==id)
    setPosts(postsList)
    navigate('/')
    }catch(err){
      console.log(`Error:${err.message}`)
    }
  }



  return (
    <div className="App">

      <Header title = "Dhuddu Social Media" width={width}/>
      <Nav 
        search={search}
        setSearch={setSearch}
      />
      <Routes>
      <Route path="/" element={<Home posts = {searchResults}/>}/>
      <Route path="post">
      <Route index element={<NewPost
        handleSubmit={handleSubmit}
        postTile={postTile}
        setPostTitle={setPostTitle}
        postBody={postBody}
        setPostBody={setPostBody}
      />} />  
      <Route path=":id" element={<PostPage posts={posts} handleDelete={handleDelete}/>}/> 
      </Route>
      <Route path="/edit/:id" element={<EditPost
       posts={posts}
       handleEdit={handleEdit}
       editBody={editBody}
       setEditBody={setEditBody}
       editTitle={editTitle} 
       setEditTitle={setEditTitle}
       />}/>
      <Route path="about" element = {<About />} />
      <Route path="*" element = {<Missing />} />
      </Routes>
      <Footer /> 
    </div>
  );
}

export default App;
