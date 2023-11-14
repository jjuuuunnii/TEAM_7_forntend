import React, { useState, useRef } from "react";
import { S } from "./CPhtoStyle";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function CalendarPhoto() {
  let navigate = useNavigate();
  // 취소 버튼 클릭 시 캘린더로 이동
  function handleLocateCalendar() {
    navigate("/calendar");
  }

  // 일자 데이터
  const dateInfo = useSelector((state) => state.date);

  // 메모 데이터
  const [memo, setMemo] = useState("");
  const maxLength = 100;

  // 이미지 상태
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // 대표 사진 상태
  const [representativeImageIndex, setRepresentativeImageIndex] =
    useState(null);

  // 받은 데이터확인
  console.log(dateInfo);

  // 메모 실시간 변경
  const handleMemoChange = (e) => {
    const value = e.target.value;

    setMemo(value);
  };

  // 파일 선택 핸들러 수정
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).map((file) => ({
      id: Date.now() + file.name, // 고유 ID 생성
      file: file,
    }));

    if (files.length + images.length > 4) {
      alert("최대 4장의 사진만 업로드 가능합니다.");
      return;
    }

    setImages([...images, ...files]);
  };

  // CPhotoImage 클릭 핸들러
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index) => {
    setImages(images.filter((_, imgIndex) => imgIndex !== index - 1));
  };

  // 대표 사진 설정 핸들러
  const handleSetRepresentative = (index) => {
    setRepresentativeImageIndex(index - 1);
  };

  //이미지 드래그 위치 조정
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newImages = reorder(
      images,
      result.source.index,
      result.destination.index
    );

    setImages(newImages);
  };

  return (
    <S.Container>
      <S.Bg>
        <S.DayWeek>{dateInfo.dayOfWeek}</S.DayWeek>
        <S.SmallText>
          <S.DateColor>{dateInfo.yearMonthDay}</S.DateColor>
        </S.SmallText>
        <S.SettingPhoto>
          <S.SettingText>사진 설정</S.SettingText>
        </S.SettingPhoto>
        <S.PhotoContainer>
          {Array.from({ length: 5 }).map((_, index) => {
            const image = images[index - 1];
            return (
              <S.AddPhotoBox
                key={index}
                id={image ? image.id : `add-photo-box-${index}`} // 고유 ID 사용
                onClick={index === 0 ? handleImageClick : null}
                style={{ position: "relative" }}
              >
                {/* X 아이콘 추가 및 클릭 핸들러 연결 */}
                {index !== 0 && image && (
                  <div
                    className="delete-icon"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      cursor: "pointer",
                      color: "white",
                    }}
                  >
                    X
                  </div>
                )}
                {index === 0 ? (
                  <>
                    <S.CPhotoImage />
                    <S.CPhotoText>{images.length}/4</S.CPhotoText>
                  </>
                ) : (
                  <>
                    {images[(image, index - 1)] && (
                      <img
                        src={URL.createObjectURL(image.file)}
                        alt={`Uploaded ${index - 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    {index === 1 && (
                      <S.RepresentativePhotoText>
                        대표 사진
                      </S.RepresentativePhotoText>
                    )}
                  </>
                )}
              </S.AddPhotoBox>
            );
          })}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileSelect}
          />
        </S.PhotoContainer>

        <S.SettingMemo>
          <S.SettingText>메모</S.SettingText>
        </S.SettingMemo>
        <S.MemoBox
          placeholder="아직 작성된 일상 메모가 없습니다."
          name="memo"
          value={memo}
          onChange={handleMemoChange}
          maxLength={100}
        />
        <S.StyledMaxLength>{`${memo.length}/${maxLength}`}</S.StyledMaxLength>
        <S.CancleButton>
          <S.CalendarButtonStyle onClick={handleLocateCalendar}>
            취소
          </S.CalendarButtonStyle>
        </S.CancleButton>
        <S.SaveButton>
          <S.CalendarButtonStyle>저장</S.CalendarButtonStyle>
        </S.SaveButton>
      </S.Bg>
    </S.Container>
  );
}
