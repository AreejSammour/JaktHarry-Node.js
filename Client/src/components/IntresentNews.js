import React, { useState} from 'react';
import axios from "axios";
import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

const IntresentNews = ({ currentUser }) => {
  const { setCurrentUser } = useContext(AuthContext);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tempSelectedCategories, setTempSelectedCategories] = useState([]);

  const CatList = [
    "Riks",
    "Läns",
    "Nationell",
    "JAQT",
    "Öppen",
    "StockholmCentrala",
    "Hallstavik",
    "HaningeTyresö",
    "Lidingö",
    "Mälarö",
    "Norrort",
    "NorrtäljeNorra",
    "NorrtäljeSödra",
    "Nynäshamn",
    "Rimbo",
    "SolnaSundbyberg",
    "Söderort",
    "Södertälje",
    "UpplandsBro",
    "WermdöNacka",
    "VäsbySollentunaJärfälla",
    "Västerort",
    "ÖsteråkerVaxholm",
  ];

  const displayCategories = (category) => {
    switch (category) {
      case '':
        return 'Alla kategorier';
      case 'riks':
        return 'Riks';
      case 'lans':
        return 'Läns';
      case 'open':
        return 'Öppen';
      // Add more cases for other categories as needed
      default:
        return category;
    }
  };

  const handleInterestChange = () => {
    setShowCategoryList(!showCategoryList);
    setTempSelectedCategories([...selectedCategories]);
  };

  const handleCategorySelect = (event) => {
    const selectedCategory = event.target.value;
    if (selectedCategory === 'Alla kategorier') {
      // If 'Alla kategorier' is selected, clear other selections and select 'Alla kategorier'
      setTempSelectedCategories(['Alla kategorier']);
    } else {
      if (tempSelectedCategories.includes('Alla kategorier')) {
        // If 'Alla kategorier' is already selected, replace it with the new selection
        setTempSelectedCategories([selectedCategory]);
      } else {
        // Check if selecting this category exceeds the limit of 3
        if (tempSelectedCategories.length >= 3) {
          // If so, remove the first selected category and add the new one
          setTempSelectedCategories((prevTempSelectedCategories) => {
            const newCategories = prevTempSelectedCategories.slice(1);
            return [...newCategories, selectedCategory];
          });
        } else {
          // Otherwise, just add the selected category
          setTempSelectedCategories((prevTempSelectedCategories) => [
            ...prevTempSelectedCategories,
            selectedCategory,
          ]);
        }
      }
    }
  };
  
  

  const handleInterestSaving = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/updateUserIntress`;

      const mappedCategories = tempSelectedCategories.map(category => {
        switch (category) {
          case 'Alla kategorier':
            return '';
          case 'Riks':
            return 'riks';
          case 'Läns':
            return 'lans';
          case 'Öppen':
            return 'open';
          // Add more cases for other categories as needed
          default:
            return category;
        }
      });
      
      await axios.put(apiUrl, {
        userId: currentUser.id,
        intress1: mappedCategories[0],
        intress2: mappedCategories[1],
        intress3: mappedCategories[2],
      });
      
      // Update the selected categories state
      setSelectedCategories([...tempSelectedCategories]);

      setCurrentUser({
        ...currentUser,
        intress1: mappedCategories[0],
        intress2: mappedCategories[1],
        intress3: mappedCategories[2],
      });
      // Close the category list after saving
      setShowCategoryList(false);

    } catch (error) {
      console.error('Error updating user interests:', error);
    }
  };

  return (
    <div className='mt-5'>
      <h5>Intressanta nyheter: </h5>
      <div className='m-4 border-1 border p-2 w-100 d-flex justify-content-between'>
        
        {currentUser.intress1 &&  currentUser.intress2 &&  currentUser.intress3 ? (
          <div>
            <p className='mt-1 px-2 text-success'>Intresserad av: </p>
            <p><strong className='px-3 text-success'>{displayCategories(currentUser.intress1)} </strong> & 
            <strong className='px-3 text-success'>{displayCategories(currentUser.intress2)} </strong> &
            <strong className='px-3 text-success'>{displayCategories(currentUser.intress3)} </strong></p>
          </div>
        ) : (
          <div>
            {currentUser.intress1 || currentUser.intress2 ||  currentUser.intress3 ? (
              <div>
                <p className='mt-1 px-2 text-success'>Intresserad av: </p>
                <p><strong className='px-3 text-success'>{displayCategories(currentUser.intress1)} </strong> & 
                <strong className='px-3 text-success'>{displayCategories(currentUser.intress2)} </strong> 
                <strong className='px-3 text-success'>{displayCategories(currentUser.intress3)} </strong></p>
              </div>
            ) : (
              <div>
                <span className='mt-1 px-2'>Alla nyheter</span>   
              </div> 
            )}  
          </div>
        )}



        <p className=' px-2'>
          <button className='btn btn-outline-success' onClick={handleInterestChange}>Ändra intresse</button>
        </p>
      </div>
      <div>
      {showCategoryList && (
          <div className='my-4 border-1 border p-2 w-75 mx-auto'>
            <div className='my-2 p-2 w-100 d-flex justify-content-between mx-auto'>
              <p className='mt-3 w-50'>Du kan välja upp till tre intressen</p>
              <select
                className='form-select w-75 h-auto'
                multiple
                onChange={handleCategorySelect}
                size={8}
                value={tempSelectedCategories}
              >
                <option value='Alla kategorier'>Alla kategorier</option>
                {CatList.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className='mx-auto w-100 text-end'>
              <button className='btn btn-outline-success btn-sm' onClick={handleInterestSaving}>
                Ändra intresse
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntresentNews;
