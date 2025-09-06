from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.modules.progress.models import UserProgress, XpEvent, Badge, UserBadge, Streak, LeaderboardDaily
from app.modules.progress.schemas import ProgressUpsert, XpEventCreate, BadgeCreate

class ProgressCRUD:
    def upsert(self, db: Session, user_id: int, obj: ProgressUpsert) -> UserProgress:
        p = db.query(UserProgress).filter_by(user_id=user_id, lesson_id=obj.lesson_id).first()
        if not p:
            p = UserProgress(user_id=user_id, lesson_id=obj.lesson_id, completed=obj.completed, best_score=obj.best_score or 0)
            db.add(p)
        else:
            p.completed = obj.completed or p.completed
            if obj.best_score is not None:
                p.best_score = max(p.best_score, obj.best_score)
        db.commit(); db.refresh(p); return p

    def my_progress(self, db: Session, user_id: int):
        return db.query(UserProgress).filter_by(user_id=user_id).all()

class XpCRUD:
    def add(self, db: Session, user_id: int, obj: XpEventCreate) -> XpEvent:
        e = XpEvent(user_id=user_id, source=obj.source, delta=obj.delta)
        db.add(e)
        # leaderboard
        today = date.today()
        ld = db.query(LeaderboardDaily).filter_by(date=today, user_id=user_id).first()
        if not ld: ld = LeaderboardDaily(date=today, user_id=user_id, xp=0); db.add(ld)
        ld.xp += obj.delta
        db.commit(); db.refresh(e); return e

class BadgeCRUD:
    def create(self, db: Session, obj: BadgeCreate) -> Badge:
        b = Badge(**obj.dict()); db.add(b); db.commit(); db.refresh(b); return b

    def maybe_award(self, db: Session, user_id: int):
        # ejemplo muy simple: badges por XP total
        total_xp = db.query(func.coalesce(func.sum(XpEvent.delta), 0)).filter(XpEvent.user_id == user_id).scalar()
        badges = db.query(Badge).all()
        awarded = []
        for b in badges:
            rule = b.rule or {}
            if rule.get("type") == "xp" and total_xp >= int(rule.get("threshold", 0)):
                has = db.query(UserBadge).filter_by(user_id=user_id, badge_id=b.id).first()
                if not has:
                    ub = UserBadge(user_id=user_id, badge_id=b.id)
                    db.add(ub); awarded.append(b.code)
        db.commit()
        return awarded

class StreakCRUD:
    def touch(self, db: Session, user_id: int) -> Streak:
        today = date.today()
        s = db.get(Streak, user_id)
        if not s:
            s = Streak(user_id=user_id, current_days=1, longest_days=1, last_day=today)
            db.add(s)
        else:
            if s.last_day == today:
                pass
            elif s.last_day == today - timedelta(days=1):
                s.current_days += 1
                s.longest_days = max(s.longest_days, s.current_days)
                s.last_day = today
            else:
                s.current_days = 1
                s.last_day = today
        db.commit(); db.refresh(s); return s

crud_progress = ProgressCRUD()
crud_xp = XpCRUD()
crud_badge = BadgeCRUD()
crud_streak = StreakCRUD()
