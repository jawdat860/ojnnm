import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import ServiceModal from "./ServiceModal";
import { Spinner } from "@telegram-apps/telegram-ui";
import FooterFlex from "../FooterFlex/FooterFlex";
import axios from "axios";
import { Link as ScrollLink, Element } from "react-scroll"; // Import scroller

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category") || "All";
  const ulRef = useRef(null); // Ref for category scrolling
  const ulRef2 = useRef(null); // Ref for subcategory scrolling

  // Fetch services data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post("https://menuapp.ru/api/v1");
        setServices(data.categories);
      } catch (err) {
        setError("Failed to load services.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set active category based on URL params and scroll to it
  useEffect(() => {
    if (selectedCategory !== "All") {
      setActiveCategory(selectedCategory);
     
       // Scroll to the active category button
    }
  }, [selectedCategory]);

  // Automatically set the first subcategory as active when the category becomes active
  useEffect(() => {
    if (activeCategory) {
      scrollToCategoryButton(activeCategory.id);
      const category = services.find((cat) => cat.id === activeCategory);
      if (category && category.subcategories.length > 0) {
        setActiveSubcategory(category.subcategories[0].id); // Auto-select first subcategory
      }
    }
  }, [activeCategory, services]);

  // Handle scrolling and update active category and subcategory
  useEffect(() => {
    const handleScroll = () => {

      let foundActive = false;

      // Check for active category
      services.forEach((category) => {
        const categoryElement = document.getElementById(category.id);
        if (categoryElement) {
          const rect = categoryElement.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveCategory(category.id);
            scrollToCategoryButton(category.id)

            if (category.subcategories.length > 0) {
              // Set the first subcategory as active if not already set
              if (!activeSubcategory || !foundActive) {
                setActiveSubcategory(category.subcategories[0].id);
                scrollToSubcategoryButton(category.subcategories.id)
              }
            }
            foundActive = true; // Found active category
          }
        }
      });

      // Check for active subcategory
      services.forEach((category) => {
        if (category.subcategories) {
          category.subcategories.forEach((subcategory) => {
            const subcategoryElement = document.getElementById(subcategory.id);
            if (subcategoryElement) {
              const rect = subcategoryElement.getBoundingClientRect();
              if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                setActiveSubcategory(subcategory.id); // Update active subcategory
                foundActive = true; // Found active subcategory
              }
            }
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [services, activeSubcategory]); // Include activeSubcategory as a dependency

  const handleCardClick = (item) => {
    setActiveItem(item);
    setIsModalOpen(true);
  };

  // Scroll the category button into view
  const scrollToCategoryButton = (id) => {
    const button = document.getElementById(`btn-${id}`);
    if (button && ulRef.current) {
      const ulRect = ulRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const scrollPosition =
        buttonRect.left -
        ulRect.left +
        ulRef.current.scrollLeft -
        ulRect.width / 2 +
        buttonRect.width / 2;

      ulRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  // Scroll the subcategory button into view
  const scrollToSubcategoryButton = (id) => {
    const button = document.getElementById(`btn-${id}`);
    if (button && ulRef2.current) {
      const ulRect = ulRef2.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const scrollPosition =
        buttonRect.left -
        ulRect.left +
        ulRef2.current.scrollLeft -
        ulRect.width / 2 +
        buttonRect.width / 2;

      ulRef2.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[100%]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="rounded-t-[40px] relative z-[11] mt-[-31px] bg-[#eee]">
      <div className="container relative jawdat">
        {/* Categories List */}
        <div className="z-[1000] top-0 bg-[#eee] rounded-b-[20px] pl-3 sticky" style={{ top: 0, zIndex: 10 }}>
          <div ref={ulRef} className="flex space-x-4 overflow-x-auto py-2">
            {services.map((category) => (
              <ScrollLink
                key={category.id}
                to={category.id}
                smooth={true}
                duration={500}
                offset={-100}
                className={`px-4 py-2 block text-sm font-medium rounded-full cursor-pointer transition-all duration-300 ${
                  activeCategory === category.id ? "font-bold bg-primary text-white" : "text-gray-700"
                }`}
                onClick={() => {
                  setActiveCategory(category.id);
                  setActiveSubcategory(category.subcategories[0]?.id || null); // Set first subcategory when category changes
                  
                }}
                id={`btn-${category.id}`} // Unique ID for button reference
              >
                {category.title}
              </ScrollLink>
            ))}
          </div>
        </div>

        {/* Subcategory List */}
        {activeCategory && services.find((cat) => cat.id === activeCategory)?.subcategories.length > 0 && (
          <div ref={ulRef2} className="bg-white z-[10] py-4 px-4 rounded-b-[20px] shadow-md sticky" style={{ top: '70px' }}>
            <h2 className="text-lg font-bold text-center mb-4">{services.find((cat) => cat.id === activeCategory)?.title}</h2>
            <div className="flex space-x-2 overflow-x-auto">
              {services.find((cat) => cat.id === activeCategory).subcategories.map((subcategory) => (
                <ScrollLink
                  key={subcategory.id}
                  to={subcategory.id} // Link to subcategory id
                  smooth={true}
                  duration={500}
                  offset={-100} // Adjust scroll position (header offset)
                  className={`px-4 py-1 block text-xs font-medium rounded cursor-pointer transition-all duration-300 ${
                    activeSubcategory === subcategory.id ? "font-bold bg-primary text-white" : "text-gray-500"
                  }`}
                  onClick={() => {
                    setActiveSubcategory(subcategory.id);
                  // Scroll to the subcategory button
                  }}
                  id={`btn-${subcategory.id}`} // Unique ID for button reference
                >
                  {subcategory.title}
                </ScrollLink>
              ))}
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid gap-4 p-4 pb-[100px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative">
          {services.map((category) => (
            <div key={category.id} id={category.id}>
              <Element name={category.id}>
                <h1 className="text-lg text-center my-[20px] font-bold">{category.title}</h1>
                {category.items.length > 0 ? (
                  category.items.map((item) => (
                    <ServiceCard key={item.id} service={item} onClick={() => handleCardClick(item)} />
                  ))
                ) : (
                  <p className="text-center text-gray-500">No services available</p>
                )}

                {/* Subcategory section */}
                {category.subcategories && category.subcategories.length > 0 ? (
                  category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} id={subcategory.id}>
                      <Element name={subcategory.id}>
                        {subcategory.items && subcategory.items.length > 0 && (
                          <div>
                            <h2 className="text-md text-center my-4 font-semibold">{subcategory.title}</h2>
                            {subcategory.items.map((item) => (
                              <ServiceCard key={item.id} service={item} onClick={() => handleCardClick(item)} />
                            ))}
                          </div>
                        )}
                      </Element>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No subcategories available</p>
                )}
              </Element>
            </div>
          ))}
        </div>

        <ServiceModal isOpen={isModalOpen} onClose={setIsModalOpen} service={activeItem} />
        <FooterFlex />
      </div>
    </div>
  );
};

export default Services;
