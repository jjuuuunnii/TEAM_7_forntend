import React, { useEffect, useState } from "react";
import * as S from "./style";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

//사진 import
import EventIconBefore from "../../assets/images/EventPhoto/EventIconBefore.png";
import EventIconAfter from "../../assets/images/EventPhoto/EventIconAfter.png";

import axios from "axios";

function EventPhoto() {
  const [images, setImages] = useState([]);
  //이미지 선택 상태 관리 (삭제위한코드)
  const [selectedImages, setSelectedImages] = useState(new Set());
  const eventId = useSelector((state) => state.myEvent.value.eventId);
  const getAccessCookie = localStorage.getItem("accessCookie");
  const navigate = useNavigate();

  console.log("Access Cookie:", getAccessCookie); // 콘솔에서 accessCookie 값 확인

  useEffect(() => {
    const fetchEventImages = async () => {
      try {
        console.log(`Fetching images for event ID: ${eventId}`);
        const response = await axios.get(
          `/api/v1/event/${eventId}/image-list`,
          {
            headers: {
              Authorization: `Bearer ${getAccessCookie}`,
            },
          }
        );
        if (response.status === 200) {
          console.log("Fetched images:", response.data.imageUrlList);
          setImages(response.data.imageUrlList);
        } else {
          console.error("Failed to fetch images");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchEventImages();
  }, [eventId, getAccessCookie]);
  //드래그 이미지 선택 상태 관리 (삭제 드래그)
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e) => {
    // 선택된 파일 목록을 배열로 변환
    const files = Array.from(e.target.files);

    // 이미 업로드된 이미지와 새로 업로드하려는 이미지의 총 개수
    const totalImages = images.length + files.length;

    e.target.value = "";

    // 총 이미지 수가 130개를 넘지 않는 경우에만 이미지 처리
    if (totalImages <= 130) {
      const newImages = files.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
        });
      });

      Promise.all(newImages).then((newImages) => {
        setImages((prevImages) => [...prevImages, ...newImages]);
      });
    } else {
      alert("최대 130개의 이미지만 업로드할 수 있습니다.");
    }
  };

  // 이미지 드래그 앤 드롭 기능
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processImages(files);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    for (const image of images) {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });
      formData.append("imageList[]", file);

      // 파일의 세부 정보 출력
      console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
    }

    // FormData 내용 콘솔에 출력 (디버깅 목적)
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      // 서버에 POST 요청
      const response = await axios.post(`/api/v1/event/${eventId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getAccessCookie}`,
        },
      });

      if (response.status === 200) {
        alert("이미지가 저장되었습니다 :)");
        navigate(`/eventdisplay/${eventId}`);
      } else {
        alert("업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("네트워크 오류가 발생했습니다.");
    }
  };
  // 이미지 처리 함수
  const processImages = (files) => {
    // 이미 업로드된 이미지와 새로 업로드하려는 이미지의 총 개수 계산

    const totalImages = images.length + files.length;

    // 총 이미지 수가 130개를 넘지 않는 경우에만 이미지 처리
    if (totalImages <= 130) {
      const newImages = files.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
        });
      });

      Promise.all(newImages).then((newImages) => {
        setImages((prevImages) => [...prevImages, ...newImages]);
      });
    } else {
      alert("최대 130개의 이미지만 업로드할 수 있습니다.");
    }
  };

  // 이미지 선택/해제 처리
  const toggleImageSelection = (index) => {
    setSelectedImages((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  // 선택된 이미지 삭제 처리
  const deleteSelectedImages = () => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => !selectedImages.has(index))
    );
    setSelectedImages(new Set()); // 선택 상태 초기화
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (index) => {
    if (isDragging) {
      toggleImageSelection(index);
    }
  };

  const handleClick = (index) => {
    if (!isDragging) {
      toggleImageSelection(index);
    }
  };

  return (
    <S.EventPhotoWrapper>
      <S.EventName>나의 이벤트명</S.EventName>
      <S.ImageUploadContainer onDragOver={handleDragOver} onDrop={handleDrop}>
        <S.UploadButton htmlFor="file-input" hasImages={images.length > 0}>
          <S.UploadIcon
            src={images.length > 0 ? EventIconAfter : EventIconBefore}
            alt={
              images.length > 0 ? "사진 선택 후 이미지" : "사진 선택 전 이미지"
            }
          />
          <S.UploadCount hasImages={images.length > 0}>
            {images.length}
          </S.UploadCount>
        </S.UploadButton>

        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        {images.map((image, index) => (
          <S.StyledImage
            key={index}
            src={image}
            alt={`Uploaded ${index}`}
            // onClick={() => toggleImageSelection(index)}
            isSelected={selectedImages.has(index)}
            onMouseDown={handleMouseDown}
            onMouseMove={() => handleMouseMove(index)}
            onMouseUp={handleMouseUp}
            onClick={() => handleClick(index)}
          />
        ))}
      </S.ImageUploadContainer>
      <S.UploadChange>
        <S.UploadChangeItem
          onClick={deleteSelectedImages}
          isSelected={selectedImages.size > 0}
        >
          삭제
        </S.UploadChangeItem>
        <S.UploadChangeItem onClick={handleSubmit}>저장</S.UploadChangeItem>
      </S.UploadChange>
    </S.EventPhotoWrapper>
  );
}

export default EventPhoto;
