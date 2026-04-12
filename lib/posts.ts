export type Category = {
  slug: string;
  label: string;
  description: string;
  image: string;
};

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  content: string[];
};

export const categories: Category[] = [
  {
    slug: "den-hoc",
    label: "Đèn học",
    description: "Các bài viết về đèn bàn, đèn kẹp bàn và ánh sáng học tập.",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "ban-hoc",
    label: "Bàn học",
    description: "Bàn học gấp, bàn làm việc nhỏ gọn, hợp phòng trọ.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "ke-mini",
    label: "Kệ mini",
    description: "Kệ để bàn, kệ sách mini và đồ tổ chức không gian.",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "phu-kien",
    label: "Phụ kiện",
    description: "Giá đỡ laptop, hộp đựng đồ, thảm bàn và phụ kiện nhỏ.",
    image:
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1200&q=80",
  },
];

export const posts: Post[] = [
  {
    slug: "den-hoc-cho-phong-tro",
    title: "Top đèn học cho phòng trọ nhỏ",
    description:
      "Gợi ý đèn học gọn, sáng đều, hợp sinh viên và không chiếm nhiều diện tích.",
    category: "den-hoc",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
    tags: ["đèn học", "phòng trọ", "bàn học", "USB"],
    content: [
      "Khi chọn đèn học cho phòng trọ, bạn nên ưu tiên kích thước gọn, dễ kẹp vào bàn và ánh sáng dễ chịu.",
      "Nếu bạn học ban đêm nhiều, hãy chọn mẫu có nhiều mức sáng và màu ánh sáng trung tính.",
      "Bạn cũng nên ưu tiên sản phẩm có review thật, dễ thay bóng hoặc sử dụng cổng USB.",
    ],
  },
  {
    slug: "ban-gap-cho-sinh-vien",
    title: "Bàn gấp cho sinh viên có đáng mua không",
    description:
      "Phân tích ưu điểm, nhược điểm và trường hợp nên mua bàn gấp cho phòng trọ.",
    category: "ban-hoc",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    tags: ["bàn gấp", "bàn học", "sinh viên", "phòng trọ"],
    content: [
      "Bàn gấp hợp khi phòng nhỏ và cần tiết kiệm diện tích.",
      "Nếu bạn ngồi học rất lâu, hãy ưu tiên bàn có độ cao phù hợp và mặt bàn chắc chắn.",
      "Bạn nên đo kích thước phòng trước khi mua để tránh bị vướng lối đi.",
    ],
  },
  {
    slug: "ke-mini-de-ban-hoc",
    title: "Kệ mini để bàn học loại nào hợp phòng trọ",
    description:
      "Cách chọn kệ mini để bàn học gọn, dễ lắp và không làm phòng bị rối.",
    category: "ke-mini",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    tags: ["kệ mini", "kệ để bàn", "phòng trọ", "sắp xếp"],
    content: [
      "Kệ mini phù hợp với sinh viên vì giúp sắp xếp sách vở và phụ kiện gọn hơn.",
      "Nên ưu tiên loại nhẹ, dễ lau chùi và dễ tháo lắp.",
      "Nếu bạn học ở phòng trọ nhỏ, nên chọn kệ có chiều ngang vừa phải.",
    ],
  },
  {
    slug: "gia-do-laptop-cho-ban-nho",
    title: "Giá đỡ laptop cho bàn nhỏ có cần thiết không",
    description:
      "Những trường hợp nên mua giá đỡ laptop để học và làm việc thoải mái hơn.",
    category: "phu-kien",
    image:
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1200&q=80",
    tags: ["giá đỡ laptop", "phụ kiện", "góc học tập", "bàn nhỏ"],
    content: [
      "Giá đỡ laptop giúp màn hình cao hơn, dễ ngồi đúng tư thế hơn.",
      "Nếu bạn dùng thêm bàn phím và chuột rời, trải nghiệm sẽ dễ chịu hơn nhiều.",
      "Bạn nên chọn loại chắc chắn, dễ gập và không bị rung khi gõ phím.",
    ],
  },
  {
    slug: "setup-goc-hoc-tap-duoi-500k",
    title: "Setup góc học tập dưới 500k cho sinh viên",
    description:
      "Gợi ý cách mua từng món đồ cần thiết để có góc học tập gọn đẹp mà vẫn tiết kiệm.",
    category: "phu-kien",
    image:
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
    tags: ["setup bàn học", "dưới 500k", "phòng trọ", "sinh viên"],
    content: [
      "Nếu ngân sách thấp, bạn nên ưu tiên đèn học, hộp đựng đồ và giá đỡ laptop đơn giản.",
      "Không cần mua quá nhiều thứ ngay từ đầu, hãy mua theo mức độ sử dụng thật.",
      "Phòng trọ gọn gàng hơn sẽ giúp bạn học tập tập trung hơn.",
    ],
  },
  {
    slug: "hop-dung-do-ban-hoc-nen-mua-loai-nao",
    title: "Hộp đựng đồ bàn học nên mua loại nào",
    description:
      "Một món nhỏ nhưng rất hữu ích nếu bạn hay bị rối dây cáp, bút viết và phụ kiện.",
    category: "ke-mini",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    tags: ["hộp đựng đồ", "bàn học", "sắp xếp", "phụ kiện"],
    content: [
      "Hộp đựng đồ giúp mặt bàn trông gọn hơn và dễ lấy đồ cần dùng.",
      "Loại nhựa cứng, dễ lau chùi và có ngăn chia sẽ hợp phòng trọ.",
      "Bạn nên chọn kích thước vừa phải, không quá cao để tránh chướng chỗ.",
    ],
  },
];