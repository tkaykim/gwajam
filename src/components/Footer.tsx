import { SiteLogo } from "@/components/SiteLogo";

const PHONE = "010-2087-0621";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-xl px-4 py-8">
        <a
          href="https://www.modoouniform.com/home"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-6"
        >
          <SiteLogo height={36} />
        </a>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-sm text-muted-foreground">
          <section>
            <h3 className="font-semibold text-foreground mb-2">사업자 정보</h3>
            <ul className="space-y-1">
              <li>상호명: 피스코프</li>
              <li>주소: 서울특별시 마포구 새터산 4길 2, B102호</li>
              <li>
                전화:{" "}
                <a href={`tel:${PHONE.replace(/-/g, "")}`} className="text-primary hover:underline">
                  {PHONE}
                </a>
              </li>
              <li>사업자등록번호: 118-08-15095</li>
              <li>대표자: 김현준</li>
              <li>개인정보 책임자: 이은원</li>
              <li>통신판매업신고번호: 2021-서울마포-1399</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">BANK INFO</h3>
            <ul className="space-y-1">
              <li>우리은행</li>
              <li>1005904144208</li>
              <li>예금주: 피스코프</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-2">고객 지원</h3>
            <ul className="space-y-1">
              <li>운영시간: 평일 10시~22시</li>
              <li>점심시간: 12:00 ~ 13:00</li>
              <li>주말/공휴일 휴무</li>
            </ul>
          </section>
        </div>
      </div>
    </footer>
  );
}
