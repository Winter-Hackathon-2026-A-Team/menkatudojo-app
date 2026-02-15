from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.question import Question
from config.settings import settings
from core.exceptions import QuestionNotFoundError, ForbiddenError

def get_question_data(db, user, question_id):
    question = db.query(Question).filter(Question.id == question_id).first()
    
    # 存在しない質問だったら
    if not question:
        raise QuestionNotFoundError()

    #　他のユーザーの質問を取得しようとしたら
    if question.source == "user" and question.owner_user_id != user.id:
        raise ForbiddenError()


    return {
        "questionId": question.id,
        "categoryName": question.category,
        "questionContent": question.question,
        "source": question.source,
        "sortOrder": question.sort_order,
        "durationLimitSeconds": settings.MAX_RECORDING_DURATION_S
    }