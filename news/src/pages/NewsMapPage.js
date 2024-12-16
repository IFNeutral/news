import React, { useEffect, useState } from "react";
import axios from "axios";

function NewsMapPage() {
  const [clickedLocation, setClickedLocation] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState({}); // 선택된 도 상태
  const [selectedCategories, setSelectedCategories] = useState({
    employment: false,
    touristAttractions: false,
    festivals: false,
  });
  const [newsMarkers, setNewsMarkers] = useState([]);
  const [newsList, setNewsList] = useState([]); // 뉴스 목록 상태

  // 대한민국 모든 행정구역 '도'
  const regions = [
    "서울특별시",
    "부산광역시",
    "대구광역시",
    "인천광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",
    "세종특별자치시",
    "경기도",
    "강원도",
    "충청북도",
    "충청남도",
    "전라북도",
    "전라남도",
    "경상북도",
    "경상남도",
    "제주특별자치도",
  ];

  const handleSearch = async () => {
    const selectedRegionName = Object.keys(selectedRegion).find(
      (key) => selectedRegion[key]
    );
  
    if (!selectedRegionName) {
      alert("도(지역)를 하나 선택해주세요.");
      return;
    }
  
    const selectedCategory = Object.keys(selectedCategories).find(
      (key) => selectedCategories[key]
    );
  
    if (!selectedCategory) {
      alert("카테고리를 하나 선택해주세요.");
      return;
    }
  
    try {
      const response = await axios.get("http://127.0.0.1:5000/search_news", {
        params: {
          region: selectedRegionName,
          category: selectedCategory,
        },
      });
  
      if (response.data.error) {
        alert(response.data.error);
        return;
      }
  
      const { news } = response.data;
  
      if (!window.naver || !window.naver.maps) {
        console.error("네이버 지도 API가 로드되지 않았습니다.");
        return;
      }
  
      const map = new window.naver.maps.Map("map", {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 10,
      });
      console.log("지도 객체 생성 완료:", map);
  
      // 기존 마커 제거
      newsMarkers.forEach((marker) => marker.setMap(null));
  
      // 유효한 좌표를 가진 기사만 필터링
      const validNews = news.filter((article) => {
        console.log("기사 데이터:", article);
        return article.lat && article.lng;
      });
      console.log("유효한 좌표 기사:", validNews);
  
      // 지도 중심 설정
      if (validNews.length > 0) {
        const firstLat = parseFloat(validNews[0].lat);
        const firstLng = parseFloat(validNews[0].lng);
        map.setCenter(new window.naver.maps.LatLng(firstLat, firstLng));
        console.log("지도 중심 설정 완료:", { lat: firstLat, lng: firstLng });
      }
  
      // 새 마커 생성
      const markers = validNews.map((article) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            parseFloat(article.lat),
            parseFloat(article.lng)
          ),
          map: map,
        });
        console.log("마커 생성 완료:", marker);
  
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `<div style="padding:10px;">
                      <h4>${article.title}</h4>
                      <p>${article.description}</p>
                      <a href="${article.link}" target="_blank">기사 보기</a>
                    </div>`,
        });
  
        window.naver.maps.Event.addListener(marker, "click", () => {
          infoWindow.open(map, marker);
        });
  
        return marker;
      });
  
      setNewsMarkers(markers);
      setNewsList(news);
  
    } catch (error) {
      console.error("Error fetching news:", error);
      alert("뉴스를 가져오는 중 오류가 발생했습니다.");
    }
  };
  

  const handleRegionChange = (e) => {
    const { name, checked } = e.target;
    setSelectedRegion((prevRegions) => ({
      ...prevRegions,
      [name]: checked,
    }));
  };

  const handleCategoryChange = (e) => {
    const { name, checked } = e.target;
    setSelectedCategories((prevCategories) => ({
      ...prevCategories,
      [name]: checked,
    }));
  };

  useEffect(() => {
    const mapOptions = {
      center: new window.naver.maps.LatLng(37.4488, 127.1267),
      zoom: 7,
    };
    const map = new window.naver.maps.Map("map", mapOptions);
    return () => {
      // Clean up markers
      newsMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [newsMarkers]);

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <div style={{ flex: 2, paddingRight: "20px" }}>
        <h1>지역 뉴스 MAP</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
          <h3 style={{ gridColumn: "span 6" }}>지역 선택</h3>
          {regions.map((region) => (
            <label key={region} style={{ display: "block" }}>
              <input
                type="checkbox"
                name={region}
                checked={!!selectedRegion[region]}
                onChange={handleRegionChange}
              />
              {region}
            </label>
          ))}
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>카테고리 선택</h3>
          <label>
            <input
              type="checkbox"
              name="employment"
              checked={selectedCategories.employment}
              onChange={handleCategoryChange}
            />
            취업
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              name="touristAttractions"
              checked={selectedCategories.touristAttractions}
              onChange={handleCategoryChange}
            />
            관광지
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              name="festivals"
              checked={selectedCategories.festivals}
              onChange={handleCategoryChange}
            />
            축제
          </label>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleSearch}
            style={{
              padding: "10px",
              backgroundColor: "#0078FF",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            뉴스 검색
          </button>
        </div>

        <div
          id="map"
          style={{
            width: "100%",
            height: "600px",
            borderRadius: "8px",
            overflow: "hidden",
            marginTop: "20px",
          }}
        ></div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: "600px" }}>
        <h2>뉴스 목록</h2>
        {newsList.length === 0 ? (
          <p>선택한 지역과 카테고리의 뉴스를 검색해 주세요.</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {newsList.map((article, index) => (
              <li key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#0078FF" }}>
                  <h4>{article.title}</h4>
                </a>
                <p>{article.description || "요약문을 가져올 수 없습니다."}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NewsMapPage;
